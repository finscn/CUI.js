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

        webgl: false,

        init: function() {

            this.context = this.context || this.canvas.getContext("2d");
            this.canvas = this.canvas || this.context.canvas;

            this.defaultTransform = {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                alpha: 1,
                originalX: 0,
                originalY: 0,
                blend: "source-over",
            };

            this.resetGlobalContainer();

            this.render = this.drawDisplayObject;
        },

        begin: function(clear) {
            clear && this.clear();
        },
        end: function() {
            // nothing to do.
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

        /**
         *
         *
         *
         *
         *
         *
         **/

        save: function() {
            this.context.save();
            var t = this.globalTransform;
            this.transformStack.push({
                x: t.x,
                y: t.y,
                scaleX: t.scaleX,
                scaleY: t.scaleY,
                rotation: t.rotation,
                alpha: t.alpha,
                originalX: t.originalX,
                originalY: t.originalY,
            });
        },
        restore: function() {
            this.context.restore();
            var lt = this.transformStack.pop();
            if (!lt) {
                return;
            }
            var t = this.globalTransform;
            t.x = lt.x;
            t.y = lt.y;
            t.scaleX = lt.scaleX;
            t.scaleY = lt.scaleY;
            t.rotation = lt.rotation;
            t.alpha = lt.alpha;
            t.originalX = lt.originalX;
            t.originalY = lt.originalY;
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
        setAlpha: function(alpha) {
            this.context.globalAlpha = alpha;
        },
        getAlpha: function() {
            return this.context.globalAlpha;
        },
        setOriginal: function(x, y) {
            this.context.translate(x, y);
            this.globalTransform.originalX = x;
            this.globalTransform.originalY = y;
        },
        clipRect: function(x, y, width, height) {
            this.context.save();
            var t = this.globalTransform;
            var dx = x - t.originalX;
            var dy = y - t.originalY;

            var _context = this.context;
            _context.beginPath();
            _context.moveTo(dx, dy);
            _context.lineTo(dx + width, dy);
            _context.lineTo(dx + width, dy + height);
            _context.lineTo(dx, dy + height);
            _context.closePath();
            _context.clip();
            return _context;
        },
        unclipRect: function() {
            this.context.restore();
        },
        setBlend: function(blend) {
            this._lastBlend = this.blend;

            this.blend = blend;
            // TODO;
            var composite = blend;
            this.context.globalCompositeOperation = composite;
        },

        resetGlobalContainer: function() {
            this.transformStack = [];
            this.globalTransform = {};
            for (var p in this.defaultTransform) {
                this.globalTransform[p] = this.defaultTransform[p];
            }
        },

        /**
         *
         *
         *
         *
         *
         *
         **/

        clear: function() {
            if (this.clearColor) {
                this.fillStyle = this.clearColor;
                this.fillRect(0, 0, this.canvas.width, this.canvas.height);
                return;
            }
            this.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },

        strokeRect: function(x, y, width, height, color, lineWidth) {
            var t = this.globalTransform;
            var dx = x - t.originalX;
            var dy = y - t.originalY;

            color && (this.context.strokeStyle = color);
            lineWidth && (this.context.lineWidth = lineWidth);
            this.context.strokeRect(dx, dy, width, height);
        },

        fillRect: function(x, y, width, height, color) {
            var t = this.globalTransform;
            var dx = x - t.originalX;
            var dy = y - t.originalY;

            color && (this.context.fillStyle = color);
            this.context.fillRect(dx, dy, width, height);
        },

        clearRect: function(x, y, width, height) {
            var t = this.globalTransform;
            var dx = x - t.originalX;
            var dy = y - t.originalY;

            if (this.clearColor) {
                this.context.fillStyle = this.clearColor;
                this.context.fillRect(dx, dy, width, height);
            } else {
                this.context.clearRect(dx, dy, width, height);
            }
        },

        drawDisplayObject: function(displayObject, dx, dy, dw, dh) {
            var count = arguments.length;

            var image = displayObject.img;
            var sx = displayObject.sx;
            var sy = displayObject.sy;
            var sw = displayObject.sw;
            var sh = displayObject.sh;

            var t = this.globalTransform;
            dx = dx - t.originalX;
            dy = dy - t.originalY;

            if (count === 5) {
                // dx, dy, dw, dh
                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
            } else if (count === 3) {
                // dx, dy
                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, image.width, image.height);
            }
        },

        renderBasic: function(displayObject) {
            this.drawDisplayObject(displayObject, 0, 0);
        },

        drawImage: function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
            var count = arguments.length;

            var t = this.globalTransform;
            if (count === 9) {
                dx = dx - t.originalX;
                dy = dy - t.originalY;
                this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
            } else if (count === 5) {
                // dx, dy, dw, dh
                dx = sx - t.originalX;
                dy = sy - t.originalY;
                this.context.drawImage(image, sx, sy, sw, sh);
            } else {
                // dx, dy
                dx = sx - t.originalX;
                dy = sy - t.originalY;
                this.context.drawImage(image, sx, sy);
            }
            return image;
        },

        renderNineSliceObject: function(displayObject, dx, dy, dw, dh) {
            var o = displayObject;

            var x = dx;
            var y = dy;
            var w = dw;
            var h = dh;

            var T = o["T"];
            var R = o["R"];
            var B = o["B"];
            var L = o["L"];

            var CW = w - L - R,
                CH = h - T - B;

            o["CL"] && this.drawDisplayObject(o["CL"], x, y + T, L, CH);
            o["CC"] && this.drawDisplayObject(o["CC"], x + L, y + T, CW, CH);
            o["CR"] && this.drawDisplayObject(o["CR"], x + w - R, y + T, R, CH);

            o["TL"] && this.drawDisplayObject(o["TL"], x, y, L, T);
            o["TC"] && this.drawDisplayObject(o["TC"], x + L, y, CW, T);
            o["TR"] && this.drawDisplayObject(o["TR"], x + w - R, y, R, T);

            o["BL"] && this.drawDisplayObject(o["BL"], x, y + h - B, L, B);
            o["BC"] && this.drawDisplayObject(o["BC"], x + L, y + h - B, CW, B);
            o["BR"] && this.drawDisplayObject(o["BR"], x + w - R, y + h - B, R, B);
        },

        /**
         *
         *
         *
         *
         *
         *
         **/

        createDisplayObject: function(img, sx, sy, sw, sh, container) {
            var count = arguments.length;
            if (count === 2) {
                container = sx;
                sx = 0;
            }
            var displayObject = {
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
            return displayObject;
        },

        createTextObject: function(context, container) {
            var canvas = context.canvas;
            var textObject = this.createDisplayObject(canvas);
            textObject.resolution = 1;
            textObject.context = context;
            textObject.canvas = canvas;
            textObject.padding = 0;
            textObject.updateSize = function() {
                this.sw = this.canvas.width;
                this.sh = this.canvas.height;
            };
            return textObject;
        },

        createNineSliceObject: function(img, sx, sy, sw, sh, T, R, B, L, container) {
            var bw = sw - L - R;
            var bh = sh - T - B;
            var nineSliceObject = {};
            var o = nineSliceObject;
            o["T"] = T;
            o["R"] = R;
            o["B"] = B;
            o["L"] = L;

            // center-left;
            o["CL"] = this.createDisplayObject(
                img, sx, sy + T, L, bh, container
            );

            o["CC"] = this.createDisplayObject(
                img, sx + L, sy + T, bw, bh, container
            );

            // center-right;
            o["CR"] = this.createDisplayObject(
                img, sx + sw - R, sy + T, R, bh, container
            );

            if (T > 0) {
                if (L > 0) {
                    // top-left
                    o["TL"] = this.createDisplayObject(
                        img, sx, sy, L, T, container
                    );
                }
                // top-center
                o["TC"] = this.createDisplayObject(
                    img, sx + L, sy, bw, T, container
                );

                if (R > 0) {
                    // top-left
                    o["TR"] = this.createDisplayObject(
                        img, sx + sw - R, sy, R, T, container
                    );
                }
            }

            if (B > 0) {
                if (L > 0) {
                    // bottom-left
                    o["BL"] = this.createDisplayObject(
                        img, sx, sy + sh - B, L, B, container
                    );
                }
                // bottom-center
                o["BC"] = this.createDisplayObject(
                    img, sx + L, sy + sh - B, bw, B, container
                );
                if (R > 0) {
                    // bottom-left
                    o["BR"] = this.createDisplayObject(
                        img, sx + sw - R, sy + sh - B, R, B, container
                    );
                }
            }
            return nineSliceObject;
        },

    });

    exports.CanvasRenderer = CanvasRenderer;

    if (typeof module != "undefined") {
        module.exports = CanvasRenderer;
    }

}(CUI));
