"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Font = exports.Font;

    var PIXIRenderer = Class.create({

        canvas: null,
        context: null,

        init: function() {

            var canvas = this.canvas;

            this.core = PIXI.autoDetectRenderer(canvas.width, canvas.height, {
                view: canvas,
            });

            // this.globalTransform = {
            //     a: 1,
            //     b: 0,
            //     c: 0,
            //     d: 1,
            //     tx: 0,
            //     ty: 0
            // };
            // this._lastWorldTransform = this.globalTransform;
            // this.globalAlpha = 1;
            // this._lastGlobalAlpha = 1;

            // // TODO;
            // this.blend = this.context.globalCompositeOperation;
            // this._lastBlend = this.blend;
        },

        createDisplayObject: function(img, sx, sy, sw, sh) {
            var baseTexture = new PIXI.BaseTexture(img);
            var texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(sx, sy, sw, sh))
            return PIXI.Sprite.from(texture);
        },

        drawDisplayObject: function(displayObject, dx, dy, dw, dh) {
            var texture = displayObject.texture;

            texture._frame.x = dx;
            texture._frame.y = dy;

            if (count === 5) {
                // dx, dy, dw, dh
                texture._frame.width = dw;
                texture._frame.height = dh;
                // displayObject.scale.set(1, 1);
            } else if (count === 3) {

            }
            this.core.render(displayObject);
        },

        drawImage: function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
            var displayObject;
            var count = arguments.length;
            if (count === 9) {
                displayObject = this.createDisplayObject(image, sx, sy, sw, sh);
                this.drawDisplayObject(displayObject, dx, dy, dw, dh);
            } else if (count === 3) {
                displayObject = this.createDisplayObject(image, 0, 0, image.width, image.height);
                // dx, dy
                this.drawDisplayObject(displayObject, sx, sy);
            } else {
                displayObject = this.createDisplayObject(image, 0, 0, image.width, image.height);
                // dx, dy, dw, dh
                this.context.drawImage(image, sx, sy, sw, sh);
            }
            return displayObject;
        },

        strokeRect: function(x, y, width, height, color, lineWidth) {

        },

        fillRect: function(x, y, width, height, color) {

        },

        save: function() {

        },
        restore: function() {

        },

        translate: function(x, y) {

        },
        scale: function(x, y) {

        },
        rotate: function(rotation) {

        },

        transform: function(globalTransform) {
            this._lastWorldTransform = this.globalTransform;
            this.globalTransform = globalTransform;
        },
        doTransform: function(globalTransform) {

            this.transform(globalTransform);
        },
        undoTransform: function() {

            this.globalTransform = this._lastWorldTransform;
        },

        clipRect: function(x, y, width, height) {
            var _core = this.core;

            return _core;
        },
        doClipRect: function(x, y, width, height) {

            return this.clipRect(x, y, width, height);
        },
        undoClipRect: function() {

        },

        setAlpha: function(alpha) {
            // this._lastGlobalAlpha = this.context.globalAlpha;

            this.globalAlpha = alpha;
        },
        restoreAlpha: function() {

            // this.globalAlpha = this._lastGlobalAlpha;
        },

        applyAlpha: function(alpha) {
            this.globalAlpha *= alpha;

        },
        unapplyAlpha: function(alpha) {
            this.globalAlpha /= alpha;

        },

        setBlend: function(blend) {
            this._lastBlend = this.blend;

            this.blend = blend;

        },

        restoreBlend: function() {
            var blend = this._lastBlend;

            this.blend = blend;

        },

    });

    exports.PIXIRenderer = PIXIRenderer;

    if (typeof module != "undefined") {
        module.exports = PIXIRenderer;
    }

}(CUI));
