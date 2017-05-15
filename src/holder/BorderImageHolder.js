"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var ImageHolder = exports.ImageHolder;

    var BorderImageHolder = Class.create({
        superclass: ImageHolder,

        initialize: function() {
            this.borderImage = true;

            this.width = "100%";
            this.height = "100%";

            this.T = null;
            this.R = null;
            this.B = null;
            this.L = null;

            this.fill = true;

            this.useCache = false;
        },

        render: function(renderer, timeStep, now) {
            var bi = this;

            var width = this.pixel.width;
            var height = this.pixel.height;

            if (this.useCache) {
                if (!this.cacheCanvas) {
                    this.cacheCanvas = this.cacheBorderImage(width, height);
                    this.cacheDisplayObject = renderer.createDisplayObject(this.cacheCanvas);
                }
                renderer.drawDisplayObject(this.cacheDisplayObject, 0, 0, width, height);
            } else {
                this.renderBorderImage(renderer, this.x, this.y, width, height);
            }
        },

        initDisplayObject: function() {
            // do nothing.
        },

        initBorderDisplayObject: function(renderer, w, h, cached) {
            var img = this.img;
            var pixel = this.pixel;
            var sx = pixel.sx || 0;
            var sy = pixel.sy || 0;
            var sw = pixel.sw || img.width;
            var sh = pixel.sh || img.height;

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
            var canvas = Component.getCanvasFromPool(this.id);
            canvas.width = w;
            canvas.height = h;
            var context = canvas.getContext("2d");
            var renderer = new CUI.CanvasRenderer({
                context: context
            });
            this.renderBorderImage(renderer, 0, 0, w, h, true);
            return canvas;
        },

    });


    exports.BorderImageHolder = BorderImageHolder;

    if (typeof module != "undefined") {
        module.exports = BorderImageHolder;
    }

}(CUI));
