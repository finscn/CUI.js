"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Font = exports.Font;

    var CanvasRenderer = Class.create({

        lazyInit: false,

        canvas: null,
        context: null,
        clearColor: null,

        init: function() {

            this.context = this.context || this.canvas.getContext("2d");
            this.canvas = this.canvas || this.context.canvas;

            // this.transform = {
            //     scaleX: 1,
            //     scaleY: 1,
            //     rotation: 0,
            //     tx: 0,
            //     ty: 0,
            //     anchorX:0,
            //     anchorY:0,
            //     alpha: 1,
            // };
            this.textOptions = {};

            this.globalTransform = {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                tx: 0,
                ty: 0
            };
            this._lastWorldTransform = this.globalTransform;
            this.globalAlpha = 1;
            this._lastGlobalAlpha = 1;

            // TODO;
            this.blend = this.context.globalCompositeOperation;
            this._lastBlend = this.blend;
        },
        render: function(){
            // noop;
        },
        createDisplayObject: function(img, sx, sy, sw, sh, cached) {
            var count = arguments.length;
            if (count === 2) {
                cached = sx;
                sx = 0;
            }
            return {
                img: img,
                sx: sx || 0,
                sy: sy || 0,
                sw: sw || img.width,
                sh: sh || img.height,

                anchorX: 0,
                anchorY: 0,

                tx: 0,
                ty: 0,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
            };
        },

        colorRgb: function(r, g, b) {
            return "rgba(" + r + ", " + g + ", " + b + ", 1)";
        },
        colorHex: function(value) {
            return value;
        },
        colroName: function(value) {
            return value;
        },

        drawDisplayObject: function(displayObject, dx, dy, dw, dh, transform) {
            var image = displayObject.img;
            var sx = displayObject.sx;
            var sy = displayObject.sy;
            var sw = displayObject.sw;
            var sh = displayObject.sh;
            var count = arguments.length;
            if (count === 6) {
                // dx, dy, dw, dh, transform
                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
            } else if (count === 4) {
                // dx, dy, transform
                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, image.width, image.height);
            } else if (count === 5) {
                // dx, dy, dw, dh
                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
            } else if (count === 3) {
                // dx, dy
                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, image.width, image.height);
            }
        },

        drawSimpleDisplayObject: function(displayObject, dx, dy, dw, dh) {
            var image = displayObject.img;
            var sx = displayObject.sx;
            var sy = displayObject.sy;
            var sw = displayObject.sw;
            var sh = displayObject.sh;
            var count = arguments.length;
            if (count === 5) {
                // dx, dy, dw, dh
                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
            } else if (count === 3) {
                // dx, dy
                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, image.width, image.height);
            }
        },

        drawImage: function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
            var count = arguments.length;
            if (count === 9) {
                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
            } else if (count === 3) {
                // dx, dy
                this.context.drawImage(image, sx, sy);
            } else {
                // dx, dy, dw, dh
                this.context.drawImage(image, sx, sy, sw, sh);
            }
            return image;
        },

        strokeRect: function(x, y, width, height, color, lineWidth) {
            color && (this.context.strokeStyle = color);
            lineWidth && (this.context.lineWidth = lineWidth);
            this.context.strokeRect(x, y, width, height);
        },

        fillRect: function(x, y, width, height, color) {
            color && (this.context.fillStyle = color);
            this.context.fillRect(x, y, width, height);
        },

        clearRect: function(x, y, width, height, color) {
            if (this.clearColor) {
                this.context.fillStyle = this.clearColor;
                this.context.fillRect(x, y, width, height);
            } else {
                this.context.clearRect(x, y, width, height);
            }
        },
        clear: function() {
            this.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },

        save: function() {
            this.context.save();
        },
        restore: function() {
            this.context.restore();
        },

        translate: function(x, y) {
            this.context.translate(x, y);
        },
        scale: function(x, y) {
            this.context.scale(x, y);
        },
        rotate: function(rotation) {
            this.context.rotate(rotation);
        },

        transform: function(globalTransform) {
            this._lastWorldTransform = this.globalTransform;
            this.globalTransform = globalTransform;
            this.context.setTransform(
                globalTransform.a, globalTransform.b,
                globalTransform.c, globalTransform.d,
                globalTransform.tx, globalTransform.ty
            );
        },
        doTransform: function(globalTransform) {
            this.context.save();
            this.transform(globalTransform);
        },
        undoTransform: function() {
            this.context.restore();
            this.globalTransform = this._lastWorldTransform;
        },

        clipRect: function(x, y, width, height) {
            var _context = this.context;
            _context.beginPath();
            _context.moveTo(x, y);
            _context.lineTo(x + width, y);
            _context.lineTo(x + width, y + height);
            _context.lineTo(x, y + height);
            _context.closePath();
            _context.clip();
            return _context;
        },
        doClipRect: function(x, y, width, height) {
            this.context.save();
            return this.clipRect(x, y, width, height);
        },
        undoClipRect: function() {
            this.context.restore();
        },

        setAlpha: function(alpha) {
            // this._lastGlobalAlpha = this.context.globalAlpha;
            this.context.globalAlpha = alpha;
            this.globalAlpha = alpha;
        },
        restoreAlpha: function() {
            this.context.globalAlpha = this._lastGlobalAlpha;
            // this.globalAlpha = this._lastGlobalAlpha;
        },

        applyAlpha: function(alpha) {
            this.globalAlpha *= alpha;
            this.context.globalAlpha = this.globalAlpha;
        },
        unapplyAlpha: function(alpha) {
            this.globalAlpha /= alpha;
            this.context.globalAlpha = this.globalAlpha;
        },

        setBlend: function(blend) {
            this._lastBlend = this.blend;

            this.blend = blend;
            // TODO;
            var composite = blend;
            this.context.globalCompositeOperation = composite;
        },
        restoreBlend: function() {
            var blend = this._lastBlend;

            this.blend = blend;
            // TODO;
            var composite = blend;
            this.context.globalCompositeOperation = composite;
        },

    });

    exports.CanvasRenderer = CanvasRenderer;

    if (typeof module != "undefined") {
        module.exports = CanvasRenderer;
    }

}(CUI));
