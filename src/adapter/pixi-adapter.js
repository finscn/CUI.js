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
        console.log(p)
        Utils[p] = _utils[p];
    }

    // visible
    // alpha
    // rotation
    // width (w)
    // height (h)
    // position (x, y)
    // scale
    // anchor

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
                return this._x;
            },
            set: function(value) {
                this._x = value;
                if (this.displayObject) {
                    this.displayObject.position.x = this.pixel ? this.pixel.relativeX : value;
                }
            }
        },

        {
            key: 'absoluteY',
            get: function() {
                return this._y;
            },
            set: function(value) {
                this._y = value;
                if (this.displayObject) {
                    // this.updateDisplayObjectX(value);
                    this.displayObject.position.y = this.pixel ? this.pixel.relativeY : value;
                }
            }
        },

        {
            key: 'absoluteWidth',
            get: function() {
                return this._w;
            },
            set: function(value) {
                this._w = value;
                if (this.displayObject) {
                    // console.log('absoluteWidth', value);
                    !this.displayObject.ignoreResize && (this.displayObject.width = value);
                }
            }
        },

        {
            key: 'absoluteHeight',
            get: function() {
                return this._h;
            },
            set: function(value) {
                this._h = value;
                if (this.displayObject) {
                    console.log('absoluteHeight', value);
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
                this.displayObject && (this.displayObject.scale.set(value, value));
            }
        },

        {
            key: 'scaleX',
            get: function() {
                return this._scaleX;
            },
            set: function(value) {
                if (value === null) {
                    debugger
                }
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

        {
            key: 'anchor',
            get: function() {
                return this._anchor;
            },
            set: function(value) {
                this._anchor = value;
                this.displayObject && (this.displayObject.anchor.set(value, value));
            }
        },

        {
            key: 'anchorX',
            get: function() {
                return this._anchorX;
            },
            set: function(value) {
                this._anchorX = value;
                this.displayObject && (this.displayObject.anchor.x = value);
            }
        },

        {
            key: 'anchorY',
            get: function() {
                return this._anchorY;
            },
            set: function(value) {
                this._anchorY = value;
                this.displayObject && (this.displayObject.anchor.y = value);
            }
        },
    ];

    Class.defineProperties(Component.prototype, properties);
    Class.defineProperties(BaseHolder.prototype, properties);

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
