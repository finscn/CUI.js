"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var noop = exports.noop;

    var Font = exports.Font;
    var DisplayObject = exports.DisplayObject;

    var CanvasRenderer = Class.create({

        initialize: function() {
            this.canvas2d = true;

            this.lazyInit = false;
            this.canvas = null;
            this.context = null;
            this.clearColor = null;
        },

        init: function() {

            this.context = this.context || this.canvas.getContext("2d");
            this.canvas = this.canvas || this.context.canvas;
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

        clear: function() {
            if (this.clearColor !== null) {
                this.fillStyle = this.clearColor;
                this.fillRect(0, 0, this.canvas.width, this.canvas.height);
                return;
            }
            this.clearRect(0, 0, this.canvas.width, this.canvas.height);
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

        render: function(displayObject) {
            if (displayObject.alpha <= 0 || !displayObject.visible) {
                return;
            }

            var ctx = this.context;

            ctx.save();

            displayObject._parentAlpha = displayObject.parent ? displayObject.parent._absoluteAlpha : 1;
            displayObject._absoluteAlpha = displayObject.alpha * displayObject._parentAlpha;

            ctx.globalAlpha = displayObject._absoluteAlpha;

            if (displayObject.composite) {
                ctx.globalCompositeOperation = displayObject.composite;
            }

            ctx.translate(displayObject.position.x, displayObject.position.y);
            ctx.rotate(displayObject.rotation);
            ctx.scale(displayObject.scale.x, displayObject.scale.y);

            ctx.translate(-displayObject.pivot.x, -displayObject.pivot.y);

            var x = 0;
            var y = 0;
            if (displayObject.mask) {
                var mask = displayObject.mask.rectInfo;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + mask.width, y);
                ctx.lineTo(x + mask.width, y + mask.height);
                ctx.lineTo(x, y + mask.height);
                ctx.closePath();
                ctx.clip();
            }

            // var x = -displayObject.pivot.x;
            // var y = -displayObject.pivot.y;
            // console.log(displayObject, x, y)
            if (displayObject.imageInfo) {
                this.drawImage(displayObject, x, y);

            } else if (displayObject.borderImageInfo) {
                this.drawBorderImage(displayObject, x, y);

            } else if (displayObject.rectInfo) {
                this.drawRect(displayObject, x, y);

            } else if (displayObject.textInfo) {
                this.drawText(displayObject, x, y);
            } else {
                // TODO
            }

            var children = displayObject.children;

            for (var i = 0, len = children.length; i < len; i++) {
                this.render(children[i]);
            }

            ctx.restore();
        },

        drawRect: function(displayObject, x, y) {
            x = x || 0;
            y = y || 0;
            var ctx = this.context;

            var info = displayObject.rectInfo;

            if (info.width <= 0 || info.height <= 0) {
                return;
            }

            x += info.x;
            y += info.y;

            if (info.color) {
                ctx.fillStyle = info.color;
                ctx.fillRect(x, y, info.width, info.height);
            }

            if (info.borderColor && info.borderWidth > 0 && info.borderAlpha > 0) {
                ctx.globalAlpha = info.borderAlpha * displayObject._parentAlpha;
                ctx.lineWidth = info.borderWidth;
                ctx.strokeStyle = info.borderColor;
                ctx.strokeRect(x, y, info.width, info.height);
            }
        },

        drawImage: function(displayObject, x, y) {
            x = x || 0;
            y = y || 0;
            var ctx = this.context;

            var info = displayObject.imageInfo;
            if (!info.img) {
                return;
            }

            var w = displayObject.width;
            var h = displayObject.height;

            if (w > 0 && h > 0) {
                ctx.drawImage(info.img, info.sx, info.sy, info.sw, info.sh, x, y, w, h);
            }
        },

        drawBorderImage: function(displayObject, x, y) {
            x = x || 0;
            y = y || 0;
            var ctx = this.context;

            var info = displayObject.borderImageInfo;
            var img = info["img"];
            if (!img) {
                return;
            }
            var w = displayObject.width;
            var h = displayObject.height;


            var sx = info["sx"];
            var sy = info["sy"];
            var sw = info["sw"];
            var sh = info["sh"];

            var T = info["T"];
            var R = info["R"];
            var B = info["B"];
            var L = info["L"];

            var bw = sw - L - R;
            var bh = sh - T - B;

            var CW = w - L - R;
            var CH = h - T - B;

            // center-
            if (CH > 0) {
                L > 0 && ctx.drawImage(img, sx, sy + T, L, bh,
                    x, y + T, L, CH);
                CW > 0 && ctx.drawImage(img, sx + L, sy + T, bw, bh,
                    x + L, y + T, CW, CH);
                R > 0 && ctx.drawImage(img, sx + sw - R, sy + T, R, bh,
                    x + w - R, y + T, R, CH);
            }

            // top-
            if (T > 0) {
                L > 0 && ctx.drawImage(img, sx, sy, L, T,
                    x, y, L, T);
                CW > 0 && ctx.drawImage(img, sx + L, sy, bw, T,
                    x + L, y, CW, T);
                R > 0 && ctx.drawImage(img, sx + sw - R, sy, R, T,
                    x + w - R, y, R, T);
            }

            // bottom-
            if (B > 0) {
                L > 0 && ctx.drawImage(img, sx, sy + sh - B, L, B,
                    x, y + h - B, L, B);
                CW > 0 && ctx.drawImage(img, sx + L, sy + sh - B, bw, B,
                    x + L, y + h - B, CW, B);
                R > 0 && ctx.drawImage(img, sx + sw - R, sy + sh - B, R, B,
                    x + w - R, y + h - B, R, B);
            }
        },


        drawText: function(displayObject, x, y) {
            // drawText: function(text, x, y, style) {
            x = x || 0;
            y = y || 0;
            var ctx = this.context;

            var info = displayObject.textInfo;
            // x += info._absoluteX;
            // y += info._absoluteY;
            CUI.Utils.renderTextContent(ctx, info, x, y);
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
            var container = new DisplayObject();

            return container;
        },

        createSprite: function(image, sx, sy, sw, sh) {
            var sprite = new DisplayObject();

            var info = {
                img: image,
                sx: sx || 0,
                sy: sy || 0,
                sw: sw || (image ? image.width : 0),
                sh: sh || (image ? image.height : 0),
            };

            info.w = info.sw;
            info.h = info.sh;

            sprite.imageInfo = info;
            sprite.textureWidth = info.sw;
            sprite.textureHeight = info.sh;

            return sprite;
        },

        updateSprite: function(sprite, sx, sy, sw, sh, image) {
            var info = sprite.imageInfo || {};
            info.img = image || info.img;
            if (sx !== null) {
                info.sx = sx || 0;
            }
            if (sy !== null) {
                info.sy = sy || 0;
            }
            if (sw !== null) {
                info.sw = sw || sw === 0 ? sw : (image ? image.width : 0);
            }
            if (sh !== null) {
                info.sh = sh || sh === 0 ? sh : (image ? image.height : 0);
            }
            info.w = info.sw;
            info.h = info.sh;

            sprite.imageInfo = info;
            sprite.textureWidth = info.sw;
            sprite.textureHeight = info.sh;
        },

        createRect: function(width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha) {
            return this.updateRect(null, 0, 0, width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha);
        },

        updateRect: function(shape, x, y, width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha) {
            if (!shape) {
                shape = new DisplayObject();
            }

            shape.rectInfo = {
                x: x || 0,
                y: y || 0,
                width: width,
                height: height,
                color: backgroundColor,
                alpha: backgroundAlpha,
                borderWidth: borderWidth,
                borderColor: borderColor,
                borderAlpha: borderAlpha,
            };

            return shape;
        },

        createNineSlicePlane: function(image, sx, sy, sw, sh, L, T, R, B) {
            var sprite = new DisplayObject();

            if (arguments.length < 9) {
                L = sx;
                T = sy;
                R = sw;
                B = sh;
                sx = 0;
                sy = 0;
                sw = image ? image.width : 0;
                sh = image ? image.height : 0;
            }
            sprite.borderImageInfo = {
                img: image,
                sx: sx,
                sy: sy,
                sw: sw,
                sh: sh,
                L: L,
                T: T,
                R: R,
                B: B,
            };

            return sprite;
        },

        createTextObject: function(context, resolution) {
            var sprite;

            if (!context) {
                sprite = new DisplayObject();
                sprite.updateSize = noop;
                sprite.updateContent = noop;
            } else {
                var canvas = context.canvas;
                var sprite = this.createSprite(canvas);
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
            this.imageInfo.sw = this.canvas.width;
            this.imageInfo.sh = this.canvas.height;
            this.imageInfo.w = this.canvas.width;
            this.imageInfo.h = this.canvas.height;

            this.textureWidth = this.imageInfo.sw;
            this.textureHeight = this.imageInfo.sh;
        },

        _updateTextContent: function() {

        }

    });

    exports.CanvasRenderer = CanvasRenderer;

    if (typeof module !== "undefined") {
        module.exports = CanvasRenderer;
    }

}(CUI));
