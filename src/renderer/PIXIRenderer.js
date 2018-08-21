"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var noop = exports.noop;
    var Font = exports.Font;

    var PIXIRenderer = Class.create({

        initialize: function() {
            this.lazyInit = false;
            this.renderer = null;
        },

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

        /**
         *
         *
         *
         *
         *
         *
         **/

        createContainer: function() {
            var container = new PIXI.Container();

            return container;
        },

        createSprite: function(image, sx, sy, sw, sh) {
            var count = arguments.length;
            var texture;

            if (image && sx !== undefined) {
                texture = this._createTexture(image, sx, sy, sw, sh);
            } else if (image) {
                texture = this._createTexture(image);
            }

            var sprite = new PIXI.Sprite(texture);

            return sprite;
        },

        updateSprite: function(sprite, sx, sy, sw, sh, image) {
            var texture;
            if (image) {
                texture = this._createTexture(image, sx, sy, sw, sh);
                sprite.texture = texture;
                return;
            }

            texture = sprite._texture;
            var frame = texture._frame;

            frame.x = sx;
            frame.y = sy;
            frame.width = sw;
            frame.height = sh;
            texture._updateUvs();

            sprite._onTextureUpdate();
            texture.baseTexture.emit('update', texture.baseTexture);
        },

        createRect: function(width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha) {
            return this.updateRect(null, 0, 0, width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha);
        },

        updateRect: function(shape, x, y, width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha) {
            borderWidth = borderWidth || 0;
            if (shape) {
                shape.clear();
            } else {
                shape = new PIXI.Graphics();
                shape._ignoreResize = true;
            }
            shape.beginFill(backgroundColor, backgroundAlpha);
            if (borderWidth > 0 && (borderColor || borderColor === 0)) {
                shape.lineStyle(borderWidth, borderColor, borderAlpha, 0.5);
            }
            // shape.drawRect(borderWidth / 2, borderWidth / 2, width, height);
            shape.drawRect(x, y, width, height);
            shape.endFill();
            return shape;
        },

        createNineSlicePlane: function(image, sx, sy, sw, sh, L, T, R, B) {
            var count = arguments.length;
            var texture;

            if (count == 9) {
                texture = this._createTexture(image, sx, sy, sw, sh);
            } else {
                texture = this._createTexture(image);
                L = sx;
                T = sy;
                R = sw;
                B = sh;
            }

            var sprite = new PIXI.mesh.NineSlicePlane(texture, L, T, R, B);

            return sprite;
        },

        createTextObject: function(context, resolution) {
            var sprite;

            if (!context) {
                sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
                sprite.updateSize = noop;
                sprite.updateContent = noop;
            } else {
                var canvas = context.canvas;
                var texture = PIXI.Texture.fromCanvas(canvas);

                texture.orig = new PIXI.Rectangle();
                texture.trim = new PIXI.Rectangle();
                sprite = new PIXI.Sprite(texture);

                sprite.resolution = resolution || 1;
                sprite.context = context;
                sprite.canvas = canvas;
                sprite.padding = 0;
                sprite.updateSize = this._updateTextSize;
                sprite.updateContent = this._updateTextContent;
            }

            return sprite;
        },

        _updateTextSize: function() {
            var texture = this._texture;

            texture.baseTexture.hasLoaded = true;
            texture.baseTexture.resolution = this.resolution;
            texture.baseTexture.realWidth = this.canvas.width;
            texture.baseTexture.realHeight = this.canvas.height;
            texture.baseTexture.width = this.canvas.width / this.resolution;
            texture.baseTexture.height = this.canvas.height / this.resolution;
            texture.trim.width = texture._frame.width = this.canvas.width / this.resolution;
            texture.trim.height = texture._frame.height = this.canvas.height / this.resolution;

            texture.trim.x = -this.padding;
            texture.trim.y = -this.padding;

            texture.orig.width = texture._frame.width - (this.padding * 2);
            texture.orig.height = texture._frame.height - (this.padding * 2);

            // call sprite onTextureUpdate to update scale if _width or _height were set
            this._onTextureUpdate();
            texture.baseTexture.emit('update', texture.baseTexture);
        },

        _updateTextContent: function() {
            var texture = this._texture;

            this._textureID = -1;
            texture.baseTexture.emit('update', texture.baseTexture);
        },

        _createTexture: function(image, sx, sy, sw, sh) {
            var count = arguments.length;
            var baseTexture = PIXI.BaseTexture.from(image);

            var rect = sw && sh ? new PIXI.Rectangle(sx, sy, sw, sh) : null;
            var texture = new PIXI.Texture(baseTexture, rect);

            return texture;
        },

    });

    exports.PIXIRenderer = PIXIRenderer;

    if (typeof module !== "undefined") {
        module.exports = PIXIRenderer;
    }

}(CUI));
