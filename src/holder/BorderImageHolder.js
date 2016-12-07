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
                    this.cacheDisplayObject = renderer.createDisplayObject(this.cacheCanvas);
                }
                renderer.drawSimpleDisplayObject(this.cacheDisplayObject, 0, 0, width, height);
            } else {
                this.renderBorderImage(renderer, this.x, this.y, width, height);
            }
        },
        initDisplayObject: function() {
            // this.displayObject = CUI.renderer.createDisplayObject(this.img, this.sx, this.sy, this.sw, this.sh, true);
        },

        initBorderDisplayObject: function(renderer, w, h, cached) {
            var img = this.img;
            var sx = this.sx || 0;
            var sy = this.sy || 0;
            var sw = this.sw || img.width;
            var sh = this.sh || img.height;

            var T = this.T;
            var R = this.R;
            var B = this.B;
            var L = this.L;

            this.borderObject = renderer.createNineSliceObject(img, sx, sy, sw, sh, T, R, B, L, true);
            this.borderObject.width = w;
            this.borderObject.height = h;
            this.borderDisplayInited = true;
        },

        renderBorderImage: function(renderer, x, y, width, height, cached) {
            // debugger;
            if (!this.borderDisplayInited) {
                this.initBorderDisplayObject(renderer, width, height, cached);
                // console.log(this.borderObject.scale, width, height);
            } else {
                this.borderObject.width = width;
                this.borderObject.height = height;
            }
            renderer.renderNineSliceObject(this.borderObject, x, y, width, height);
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
