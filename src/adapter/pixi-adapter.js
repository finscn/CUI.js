"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var BaseHolder = exports.BaseHolder;

    var _utils = {
        colorRgb: function(r, g, b) {
            return (r << 16) + (g << 8) + b;
        },

        colorHex: function(value) {
            return parseInt(value.substr(-6), 16);
        },

        colroName: function(value) {
            // TODO
            return value;
        },

        createContainer: function() {
            var container = new PIXI.Container();

            return container;
        },

        createSprite: function(image, sx, sy, sw, sh) {
            var count = arguments.length;
            var texture;

            if (image && sx !== undefined) {
                texture = this.createTexture(image, sx, sy, sw, sh);
            } else if (image) {
                texture = this.createTexture(image);
            }

            var sprite = new PIXI.Sprite(texture);

            return sprite;
        },

        createRect: function(width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha) {
            return this.updateRect(null, width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha);
        },
        updateRect: function(rect, width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha) {
            borderWidth = borderWidth || 0;
            if (rect) {
                rect.clear();
            } else {
                rect = new PIXI.Graphics();
                rect.ignoreResize = true;
            }
            rect.beginFill(backgroundColor, backgroundAlpha);
            if (borderWidth > 0 && (borderColor || borderColor === 0)) {
                rect.lineStyle(borderWidth, borderColor, borderAlpha, 0.5);
            }
            // rect.drawRect(borderWidth / 2, borderWidth / 2, width, height);
            rect.drawRect(0, 0, width, height);
            rect.endFill();
            return rect;
        },

        createNineSlicePlane: function(image, sx, sy, sw, sh, L, T, R, B) {
            var count = arguments.length;
            var texture;

            if (count == 9) {
                texture = this.createTexture(image, sx, sy, sw, sh);
            } else {
                texture = this.createTexture(image);
                L = sx;
                T = sy;
                R = sw;
                B = sh;
            }

            var sprite = new PIXI.mesh.NineSlicePlane(texture, L, T, R, B);

            return sprite;
        },

        createTexture: function(image, sx, sy, sw, sh) {
            var count = arguments.length;
            var baseTexture = PIXI.BaseTexture.from(image);

            var rect = sw && sh ? new PIXI.Rectangle(sx, sy, sw, sh) : null;
            var texture = new PIXI.Texture(baseTexture, rect);

            return texture;
        },

        updateDisplayObject: function(displayObject, image, sx, sy, sw, sh) {
            var texture = this.createTexture(image, sx, sy, sw, sh);
            displayObject.texture = texture;
        },
    }

    for (var p in _utils) {
        Utils[p] = _utils[p];
    }

    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////


    // visible
    // alpha
    // rotation
    // width (w)
    // height (h)
    // position (x, y)
    // scale
    // anchor
    // zIndex

    var propertiesCommon = [

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
                this.displayObject && (this.displayObject.alpha = value);
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
                    // this.updateDisplayObjectX(value);
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
                    !this.displayObject.ignoreResize && (this.displayObject.width = value);
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
                    !this.displayObject.ignoreResize && (this.displayObject.height = value);
                }
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
                this.displayObject && (this.displayObject.scale.y = value);
            }
        },
    ];


    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////


    var propertiesComponent = [

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
            key: 'anchor',
            get: function() {
                return this._anchor;
            },
            set: function(value) {
                this._anchor = value;

                this._anchorX = value;
                this._pivotX = this._absoluteWidth * this._anchorX;

                this._anchorY = value;
                this._pivotY = this._absoluteHeight * this._anchorY;
                this.displayObject && (this.displayObject.pivot.set(this._pivotX, this._pivotY));
            }
        },

        {
            key: 'anchorX',
            get: function() {
                return this._anchorX;
            },
            set: function(value) {
                this._anchorX = value;
                this._pivotX = this._absoluteWidth * this._anchorX;

                this.displayObject && (this.displayObject.pivot.x = value);
            }
        },

        {
            key: 'anchorY',
            get: function() {
                return this._anchorY;
            },
            set: function(value) {
                this._anchorY = value;
                this._pivotY = this._absoluteHeight * this._anchorY;
                this.displayObject && (this.displayObject.pivot.y = value);
            }
        },

        {
            key: 'offsetX',
            get: function() {
                return this._offsetX;
            },
            set: function(value) {
                this._offsetX = value;
                this.pixel.relativeX = this.pixel.baseX + this._offsetX;
                this.pixel.x = this.pixel.relativeX + (this.parent ? this.parent._absoluteX : 0);
                this.absoluteX = this.pixel.x;
            }
        },

        {
            key: 'offsetY',
            get: function() {
                return this._offsetY;
            },
            set: function(value) {
                this._offsetY = value;
                this.pixel.relativeY = this.pixel.baseY + this._offsetY;
                this.pixel.y = this.pixel.relativeY + (this.parent ? this.parent._absoluteY : 0);
                this.absoluteY = this.pixel.y;
            }
        },
    ];

    Class.defineProperties(Component.prototype, propertiesCommon);
    Class.defineProperties(Component.prototype, propertiesComponent);


    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////


    var propertiesHolder = [];

    Class.defineProperties(BaseHolder.prototype, propertiesCommon);
    Class.defineProperties(BaseHolder.prototype, propertiesHolder);

    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////

    var methods = {

        addChildDisplayObject: function(child) {
            if (!child) {
                return;
            }
            if (!this.displayObject) {
                // TODO:
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
    };

    Component.prototype.initDisplayObject = function() {
        var displayObject = CUI.Utils.createContainer();
        displayObject.ignoreResize = true;
        this.displayObject = displayObject;
        this.displayObject.pivot.set(this._pivotX, this._pivotY);
        if (this.parent) {
            this.parent.addChildDisplayObject(this);
        }
    };
    for (var p in methods) {
        Component.prototype[p] = methods[p];
    }

    BaseHolder.prototype.initDisplayObject = function() {
        var displayObject = CUI.Utils.createSprite();
        this.displayObject = displayObject;
        if (this.parent) {
            this.parent.addChildDisplayObject(this);
        }
    };
    for (var p in methods) {
        BaseHolder.prototype[p] = methods[p];
    }

    // if (typeof module !== "undefined") {
    //     // do nothing
    // }

}(CUI));
