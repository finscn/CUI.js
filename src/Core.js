"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var noop = function() {};

    var Core = Class.create({

        initialize: function() {
            this.id = null;
            this.lazyInit = false;

            // 以像素为单位的定位和大小, 单位:像素
            this.pixel = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                baseX: 0,
                baseY: 0,
                relativeX: 0,
                relativeY: 0,

                // For Component
                paddingLeft: 0,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,

                marginLeft: 0,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,

                realMarginLeft: 0,
                realMarginTop: 0,
                realMarginRight: 0,
                realMarginBottom: 0,

                realOuterWidth: 0,
                realOuterHeight: 0,
            };

            this.root = null;
            this.parent = null;
            this.displayObject = null;
            this.aabb = null;

            // 默写组件支持 "auto" , 根据布局和子元素来确定自己的宽高
            // 支持 混合单位, 如 "100% - 25" , 意思为 父容器的100%再减去25像素.
            this.width = null;
            this.height = null;

            this._visible = true;
            this._alpha = 1;
            this._tint = null;
            this._rotation = 0;

            // 缩放只适合用来做瞬间的、纯视觉上的动画效果, 它不会改变UI的响应区域和行为
            // 如果要真正改变UI的大小, 请通过修改UI(以及内部元素的)width/height来实现
            this._scale = 1;
            this._scaleX = 1;
            this._scaleY = 1;

            // 绝对定位和大小, 单位:像素
            this._absoluteX = 0;
            this._absoluteY = 0;
            this._absoluteWidth = 0;
            this._absoluteHeight = 0;

            // For Component
            // 缩放/旋转 时才需要
            this._anchor = 0;
            this._anchorX = 0;
            this._anchorY = 0;
            this._pivotX = 0;
            this._pivotY = 0;

            this._offsetX = 0;
            this._offsetY = 0;

            this._needToCompute = true;
        },

        addChildDisplayObject: function(child) {
            if (!child) {
                return;
            }
            if (!this.displayObject) {
                this.initDisplayObject();
            }

            if (child.displayObject) {
                this.displayObject.addChild(child.displayObject);
            }
        },

        removeChildDisplayObject: function(child) {
            if (!child || !this.displayObject) {
                return;
            }

            if (child.displayObject) {
                this.displayObject.removeChild(child.displayObject);
            }
        },

        // TODO
        cacheAsCanvas: function(width, height) {
            var x = this._absoluteX;
            var y = this._absoluteY;
            width = width || this._absoluteWidth;
            height = height || this._absoluteHeight;

            var canvas = Component.getCanvasFromPool(this.id);
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext("2d");
            var renderer = new CUI.CanvasRenderer({
                context: context
            });
            // TODO
            renderer.render(this.displayObject);
            return canvas;
        },

        initDisplayObject: noop,

        syncDisplayObject: noop,

        updateDisplayObject: function(img, x, y, w, h) {
            // do nothing.
        },

        destroy: noop
    });

    var properties = [

        {
            key: 'visible',
            get: function() {
                return this._visible;
            },
            set: function(value) {
                this._visible = value;
                this.displayObject && (this.displayObject.visible = value);
            }
        },

        {
            key: 'alpha',
            get: function() {
                return this._alpha;
            },
            set: function(value) {
                this._alpha = value;
                if (this.displayObject) {
                    this.displayObject.alpha = value;
                    this.displayObject._absoluteAlpha = value;
                }
            }
        },

        {
            key: 'tint',
            get: function() {
                return this._tint;
            },
            set: function(value) {
                this._tint = value;
                if (this.displayObject) {
                    this.displayObject.tint = value === null ? 0xFFFFFF : value;
                }
            }
        },

        {
            key: 'rotation',
            get: function() {
                return this._rotation;
            },
            set: function(value) {
                this._rotation = value;
                this.displayObject && (this.displayObject.rotation = value);
            }
        },

        {
            key: 'scale',
            get: function() {
                return this._scale;
            },
            set: function(value) {
                this._scale = value;
                this._scaleX = value;
                this._scaleY = value;
                this.displayObject && (this.displayObject.scale.set(value, value));
            }
        },

        {
            key: 'scaleX',
            get: function() {
                return this._scaleX;
            },
            set: function(value) {
                this._scaleX = value;
                this._scale = value;
                this.displayObject && (this.displayObject.scale.x = value);
            }
        },

        {
            key: 'scaleY',
            get: function() {
                return this._scaleY;
            },
            set: function(value) {
                this._scaleY = value;
                this._scale = value;
                this.displayObject && (this.displayObject.scale.y = value);
            }
        },

        {
            key: 'absoluteX',
            get: function() {
                return this._absoluteX;
            },
            set: function(value) {
                this._absoluteX = value;
                if (this.displayObject) {
                    var x = this.pixel ? this.pixel.relativeX : value;
                    this.displayObject.position.x = x + this._pivotX;
                }
            }
        },

        {
            key: 'absoluteY',
            get: function() {
                return this._absoluteY;
            },
            set: function(value) {
                this._absoluteY = value;
                if (this.displayObject) {
                    var y = this.pixel ? this.pixel.relativeY : value;
                    this.displayObject.position.y = y + this._pivotY;
                }
            }
        },

        {
            key: 'absoluteWidth',
            get: function() {
                return this._absoluteWidth;
            },
            set: function(value) {
                this._absoluteWidth = value;
                this._pivotX = this._absoluteWidth * this._anchorX;

                if (this.displayObject) {
                    // console.log('absoluteWidth', value);
                    !this.displayObject._ignoreResize && (this.displayObject.width = value);

                    if (this._component) {
                        var x = this.pixel ? this.pixel.relativeX : this._absoluteX;
                        this.displayObject.position.x = x + this._pivotX;
                        this.displayObject.pivot.x = this._pivotX;
                    }
                }
            }
        },

        {
            key: 'absoluteHeight',
            get: function() {
                return this._absoluteHeight;
            },
            set: function(value) {
                this._absoluteHeight = value;
                this._pivotY = this._absoluteHeight * this._anchorY;
                if (this.displayObject) {
                    !this.displayObject._ignoreResize && (this.displayObject.height = value);

                    if (this._component) {
                        var y = this.pixel ? this.pixel.relativeY : this._absoluteY;
                        this.displayObject.position.y = y + this._pivotY;
                        this.displayObject.pivot.y = this._pivotY;
                    }
                }
            }
        },
    ];

    Class.defineProperties(Core.prototype, properties);

    exports.Core = Core;
    exports.noop = noop;

}(CUI));
