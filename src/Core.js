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


            this.zIndex = 0;
            this.offsetX = 0;
            this.offsetY = 0;


            this._visible = true;
            this._alpha = 1;
            this._tint = null;
            this._rotation = 0;

            // 缩放只适合用来做瞬间的、纯视觉上的动画效果, 它不会改变UI的响应区域和行为
            // 如果要真正改变UI的大小, 请通过修改UI(以及内部元素的)width/height来实现
            this._scale = 1;
            this._scaleX = 1;
            this._scaleY = 1;

            this._flipX = false;
            this._flipY = false;

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

            var canvas = Core.getCanvasFromPool(this.id);
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

        syncDisplayObject: function() {
            this.visible = this._visible;
            this.alpha = this._alpha;
            this.tint = this._tint;
            this.rotation = this._rotation;
            // this.scale = this._scale;
            this.scaleX = this._scaleX;
            this.scaleY = this._scaleY;

            // this.anchor = this._anchor;
            this.anchorX = this._anchorX;
            this.anchorY = this._anchorY;

            this.zIndex = this._zIndex;
            this.offsetX = this._offsetX;
            this.offsetY = this._offsetY;
        },

        syncPositionX: noop,
        syncPositionY: noop,

        syncDisplayWidth: noop,
        syncDisplayHeight: noop,

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
            key: 'zIndex',
            get: function() {
                return this._zIndex;
            },
            set: function(value) {
                this._zIndex = value;
                this.displayObject && (this.displayObject.zIndex = value);
                this.parent && (this.parent._toSortChildren = true);
            }
        },

        {
            key: 'offsetX',
            get: function() {
                return this._offsetX;
            },
            set: function(value) {
                this._offsetX = value;
                this.syncPositionX();
            }
        },

        {
            key: 'offsetY',
            get: function() {
                return this._offsetY;
            },
            set: function(value) {
                this._offsetY = value;
                this.syncPositionY();
            }
        },

        {
            key: 'anchor',
            get: function() {
                return this._anchor;
            },
            set: function(value) {
                this._anchor = value;
                this.anchorX = value;
                this.anchorY = value;
            }
        },

        {
            key: 'anchorX',
            get: function() {
                return this._anchorX;
            },
            set: function(value) {
                this._anchorX = value;
                this._anchor = value;
                this.syncDisplayWidth();
            }
        },

        {
            key: 'anchorY',
            get: function() {
                return this._anchorY;
            },
            set: function(value) {
                this._anchorY = value;
                this._anchor = value;
                this.syncDisplayHeight();
            }
        },

        {
            key: 'scale',
            get: function() {
                return this._scale;
            },
            set: function(value) {
                this._scale = value;
                this.scaleX = value;
                this.scaleY = value;
            }
        },

        {
            key: 'scaleX',
            get: function() {
                return this._scaleX;
            },
            set: function(value) {
                value = Math.abs(value);
                this._scaleX = value;
                this._scale = value;
                this.syncDisplayWidth();
            }
        },

        {
            key: 'scaleY',
            get: function() {
                return this._scaleY;
            },
            set: function(value) {
                value = Math.abs(value);
                this._scaleY = value;
                this._scale = value;
                this.syncDisplayHeight();
            }
        },

        {
            key: 'flipX',
            get: function() {
                return this._flipX;
            },
            set: function(value) {
                this._flipX = value;
                this.syncDisplayWidth();
            }
        },

        {
            key: 'flipY',
            get: function() {
                return this._flipY;
            },
            set: function(value) {
                this._flipY = value;
                this.syncDisplayHeight();
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
                    this.displayObject.position.x = this.pixel.relativeX + Math.abs(this._pivotX);
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
                    this.displayObject.position.y = this.pixel.relativeY + Math.abs(this._pivotY);
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
                this.syncDisplayWidth();
            }
        },

        {
            key: 'absoluteHeight',
            get: function() {
                return this._absoluteHeight;
            },
            set: function(value) {
                this._absoluteHeight = value;
                this.syncDisplayHeight();
            }
        },
    ];

    Class.defineProperties(Core.prototype, properties);

    Core._SN = 0;

    Core.canvasPool = {};
    Core.getCanvasFromPool = function(id) {
        var canvas = Core.canvasPool[id];
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = id;
            canvas.width = 3;
            canvas.height = 3;
            // canvas.holderId = id;
            Core.canvasPool[id] = canvas;
        }
        return canvas;
    };

    exports.Core = Core;
    exports.noop = noop;

}(CUI));