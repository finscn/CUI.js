"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var BackgroundHolder = exports.BackgroundHolder;

    var BorderImageHolder = Class.create({
        superclass: BackgroundHolder,

        initialize: function() {
            this.width = "100%";
            this.height = "100%";

            this.borderImage = true;

            this.T = null;
            this.R = null;
            this.B = null;
            this.L = null;

            this.fill = true;

            this.useCache = false;
        },

        render: function(renderer, timeStep, now) {
            var bi = this;

            if (this.useCache) {
                // TODO
                if (!this.cacheCanvas) {
                    this.cacheCanvas = this.cacheBorderImage(this.w, this.h);
                    this.cacheDisplayObject = renderer.createDisplayObject(this.cacheCanvas);
                }
                renderer.drawDisplayObject(this.cacheDisplayObject, this.x, this.y, this.w, this.h);
            } else {
                this.renderBorderImage(renderer, this.x, this.y, this.w, this.h);
            }
        },

        initDisplayObject: function() {
            // do nothing.
        },

        initBorderDisplayObject: function(renderer, width, height) {
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

            this.displayObject = renderer.createNineSliceObject(img, sx, sy, sw, sh, T, R, B, L, true);
            this.displayObject.width = width;
            this.displayObject.height = height;
        },

        renderBorderImage: function(renderer, x, y, width, height) {
            // debugger;
            if (!this.displayObject) {
                this.initBorderDisplayObject(renderer, width, height);
                // console.log(this.displayObject.scale, width, height);
            } else {
                this.displayObject.width = width;
                this.displayObject.height = height;
            }
            renderer.renderNineSliceObject(this.displayObject, x, y, width, height);
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

    if (typeof module !== "undefined") {
        module.exports = BorderImageHolder;
    }

}(CUI));
