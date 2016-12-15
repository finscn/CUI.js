"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var ImageHolder = exports.ImageHolder;

    var BorderImageHolder = Class.create({

        width: "100%",
        height: "100%",

        T: null,
        R: null,
        B: null,
        L: null,

        fill: true,

        useCache: false,

        render: function(context, timeStep, now) {
            var bi = this;

            var width = this.pixel.sw;
            var height = this.pixel.sh;

            if (this.useCache) {
                if (!this.cacheCanvas) {
                    this.cacheCanvas = this.cacheBorderImage(width, height);
                }
                context.drawImage(this.cacheCanvas, 0, 0, width, height);
            } else {
                this.renderBorderImage(context, this.x, this.y, width, height);
            }
        },

        initBorderDisplayObject: function(context, w, h) {
            this.borderDisplayInited = true;
        },

        renderBorderImage: function(context, x, y, width, height) {
            var img = this.img;
            var sx = this.sx || 0;
            var sy = this.sy || 0;
            var sw = this.sw || img.width;
            var sh = this.sh || img.height;

            var T = this.T;
            var R = this.R;
            var B = this.B;
            var L = this.L;
            var fill = this.fill;

            var w = width;
            var h = height;
            var bw = sw - L - R;
            var bh = sh - T - B;

            var CW = w - L - R,
                CH = h - T - B;

            if (CH > 0) {
                if (fill === true) {
                    context.drawImage(img, sx + L, sy + T, bw, bh, x + L, y + T, CW, CH);
                } else if (fill) {
                    context.fillStyle = fill;
                    context.fillRect(x + L, y + T, CW, CH);
                }
                context.drawImage(img, sx, sy + T, L, bh, x, y + T, L, CH);
                context.drawImage(img, sx + sw - R, sy + T, R, bh, x + w - R, y + T, R, CH);
            }

            if (T > 0) {
                L > 0 && context.drawImage(img, sx, sy, L, T, x, y, L, T);
                CW > 0 && context.drawImage(img, sx + L, sy, bw, T, x + L, y, CW, T);
                R > 0 && context.drawImage(img, sx + sw - R, sy, R, T, x + w - R, y, R, T);
            }

            if (B > 0) {
                L > 0 && context.drawImage(img, sx, sy + sh - B, L, B, x, y + h - B, L, B);
                CW > 0 && context.drawImage(img, sx + L, sy + sh - B, bw, B, x + L, y + h - B, CW, B);
                R > 0 && context.drawImage(img, sx + sw - R, sy + sh - B, R, B, x + w - R, y + h - B, R, B);
            }
        },

        cacheBorderImage: function(w, h) {
            var canvas = Component.getCanvasFromPool(this.id);
            canvas.width = w;
            canvas.height = h;
            var context = canvas.getContext("2d");
            this.renderBorderImage(context, 0, 0, w, h);
            return canvas;
        },


    }, ImageHolder);


    exports.BorderImageHolder = BorderImageHolder;

    if (typeof module != "undefined") {
        module.exports = BorderImageHolder;
    }

}(CUI));
