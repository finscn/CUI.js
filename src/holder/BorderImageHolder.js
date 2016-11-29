"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
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

        render: function(renderer, timeStep, now) {
            var bi = this;

            var width = this.pixel.sw;
            var height = this.pixel.sh;

            if (this.useCache) {
                if (!this.cacheCanvas) {
                    this.cacheCanvas = this.cacheBorderImage(width, height);
                    this.cacheDisplayObject = renderer.createDisplayObject(this.cacheCanvas, true);
                }
                renderer.drawSimpleDisplayObject(this.cacheDisplayObject, 0, 0, width, height);
            } else {
                this.renderBorderImage(renderer, this.x, this.y, width, height);
            }
        },
        initDisplayObject: function() {
            // this.displayObject = CUI.renderer.createDisplayObject(this.img, this.sx, this.sy, this.sw, this.sh);
        },
        initBorderDisplayObject: function(renderer, w, h, cached) {
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
                    img, sx, sy + T, L, bh, cached
                );
                if (CW > 0) {
                    // center-center;
                    if (fill === true) {
                        this.displayCC = renderer.createDisplayObject(
                            img, sx + L, sy + T, bw, bh, cached
                        );
                        this.fillCenter = null;
                    } else if (fill !== true) {
                        this.fillCenter = fill;
                        this.displayCC = null;
                    }
                }
                // center-right;
                this.displayCR = renderer.createDisplayObject(
                    img, sx + sw - R, sy + T, R, bh, cached
                );
            }

            if (T > 0) {
                if (L > 0) {
                    // top-left
                    this.displayTL = renderer.createDisplayObject(
                        img, sx, sy, L, T, cached
                    );
                }
                if (CW > 0) {
                    // top-center
                    this.displayTC = renderer.createDisplayObject(
                        img, sx + L, sy, bw, T, cached
                    );
                }
                if (R > 0) {
                    // top-left
                    this.displayTR = renderer.createDisplayObject(
                        img, sx + sw - R, sy, R, T, cached
                    );
                }
            }

            if (B > 0) {
                if (L > 0) {
                    // bottom-left
                    this.displayBL = renderer.createDisplayObject(
                        img, sx, sy + sh - B, L, B, cached
                    );
                }
                if (CW > 0) {
                    // bottom-center
                    this.displayBC = renderer.createDisplayObject(
                        img, sx + L, sy + sh - B, bw, B, cached
                    );
                }
                if (R > 0) {
                    // bottom-left
                    this.displayBR = renderer.createDisplayObject(
                        img, sx + sw - R, sy + sh - B, R, B, cached
                    );
                }
            }
            this.borderDisplayInited = true;
        },

        renderBorderImage: function(renderer, x, y, width, height, cached) {
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

            if (!this.borderDisplayInited) {
                this.initBorderDisplayObject(renderer, w, h, cached);
            }

            this.fillCenter && renderer.fillRect(x + L, y + T, CW, CH, this.fillCenter);
            this.displayCL && renderer.drawSimpleDisplayObject(this.displayCL, x, y + T, L, CH);
            this.displayCC && renderer.drawSimpleDisplayObject(this.displayCC, x + L, y + T, CW, CH);
            this.displayCR && renderer.drawSimpleDisplayObject(this.displayCR, x + w - R, y + T, R, CH);

            this.displayTL && renderer.drawSimpleDisplayObject(this.displayTL, x, y, L, T);
            this.displayTC && renderer.drawSimpleDisplayObject(this.displayTC, x + L, y, CW, T);
            this.displayTR && renderer.drawSimpleDisplayObject(this.displayTR, x + w - R, y, R, T);

            this.displayBL && renderer.drawSimpleDisplayObject(this.displayBL, x, y + h - B, L, B);
            this.displayBC && renderer.drawSimpleDisplayObject(this.displayBC, x + L, y + h - B, CW, B);
            this.displayBR && renderer.drawSimpleDisplayObject(this.displayBR, x + w - R, y + h - B, R, B);
        },

        cacheBorderImage: function(w, h) {
            var canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            var context = canvas.getContext("2d");
            var renderer = new CUI.CanvasRenderer({
                context: context
            });
            this.renderBorderImage(renderer, 0, 0, w, h, true);
            return canvas;
        },


    }, ImageHolder);


    exports.BorderImageHolder = BorderImageHolder;

    if (typeof module != "undefined") {
        module.exports = BorderImageHolder;
    }

}(CUI));
