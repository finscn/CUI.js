"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var ImageHolder = exports.ImageHolder;

    var BorderImageHolder = Class.create({

        T: null,
        R: null,
        B: null,
        L: null,

        fill: true,

        useCache: false,

        render: function(renderer, x, y, width, height, timeStep, now) {
            var bi = this;
            if (this.useCache) {
                if (!this.cacheCanvas) {
                    this.cacheCanvas = this.createImageByBorderImage(width, height);
                    this.cacheDisplayObject = renderer.createDisplayObject(this.cacheCanvas);
                }
                renderer.drawImage(this.cacheDisplayObject, x, y, width, height);
            } else {
                this.renderBorderImage(renderer, x, y, width, height);
            }
        },

        initBorderDisplayObject: function(renderer, w, h) {
            // T, R, B, L, fill, img, sx, sy, sw, sh
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

            var bw = sw - L - R;
            var bh = sh - T - B;

            var CW = w - L - R,
                CH = h - T - B;

            if (CH > 0) {
                // center-left;
                this.displayCL = renderer.createDisplayObject(
                    img, sx, sy + T, L, bh
                );
                if (CW > 0) {
                    // center-center;
                    if (fill === true) {
                        this.displayCC = renderer.createDisplayObject(
                            img, sx + L, sy + T, bw, bh
                        );
                        this.fillCenter = null;
                    } else if (fill !== true) {
                        this.fillCenter = fill;
                        this.displayCC = null;
                    }
                }
                // center-right;
                this.displayCR = renderer.createDisplayObject(
                    img, sx + sw - R, sy + T, R, bh
                );
            }

            if (T > 0) {
                if (L > 0) {
                    // top-left
                    this.displayTL = renderer.createDisplayObject(
                        img, sx, sy, L, T
                    );
                }
                if (CW > 0) {
                    // top-center
                    this.displayTC = renderer.createDisplayObject(
                        img, sx + L, sy, bw, T
                    );
                }
                if (R > 0) {
                    // top-left
                    this.displayTR = renderer.createDisplayObject(
                        img, sx + sw - R, sy, R, T
                    );
                }
            }

            if (B > 0) {
                if (L > 0) {
                    // bottom-left
                    this.displayBL = renderer.createDisplayObject(
                        img, sx, sy + sh - B, L, B
                    );
                }
                if (CW > 0) {
                    // bottom-center
                    this.displayBC = renderer.createDisplayObject(
                        img, sx + L, sy + sh - B, bw, B
                    );
                }
                if (R > 0) {
                    // bottom-left
                    this.displayBR = renderer.createDisplayObject(
                        img, sx + sw - R, sy + sh - B, R, B
                    );
                }
            }
            this.borderDisplayInited = true;
        },

        renderBorderImage: function(renderer, x, y, w, h) {
            var sx = this.sx || 0;
            var sy = this.sy || 0;
            var sw = this.sw || img.width;
            var sh = this.sh || img.height;

            var T = this.T;
            var R = this.R;
            var B = this.B;
            var L = this.L;

            var bw = sw - L - R;
            var bh = sh - T - B;

            var CW = w - L - R,
                CH = h - T - B;

            if (!this.borderDisplayInited) {
                this.initBorderDisplayObject(renderer, w, h);
            }

            this.fillCenter && renderer.fillRect(x + L, y + T, CW, CH, this.fillCenter);
            this.displayCL && renderer.drawImage(this.displayCL, x, y + T, L, CH);
            this.displayCC && renderer.drawImage(this.displayCC, x + L, y + T, CW, CH);
            this.displayCR && renderer.drawImage(this.displayCR, x + w - R, y + T, R, CH);

            this.displayTL && renderer.drawImage(this.displayTL, x, y, L, T);
            this.displayTC && renderer.drawImage(this.displayTC, x + L, y, CW, T);
            this.displayTR && renderer.drawImage(this.displayTR, x + w - R, y, R, T);

            this.displayBL && renderer.drawImage(this.displayBL, x, y + h - B, L, B);
            this.displayBC && renderer.drawImage(this.displayBC, x + L, y + h - B, CW, B);
            this.displayBR && renderer.drawImage(this.displayBR, x + w - R, y + h - B, R, B);
        },

        cacheBorderImage: function(w, h) {
            var canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            var context = canvas.getContext("2d");
            var renderer = new CUI.CanvasRenderer({
                context: context
            });
            this.renderBorderImage(renderer, 0, 0, w, h);
            return canvas;
        },


    }, ImageHolder);


    exports.BorderImageHolder = BorderImageHolder;

    if (typeof module != "undefined") {
        module.exports = BorderImageHolder;
    }

}(CUI));
