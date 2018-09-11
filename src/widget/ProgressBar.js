// TODO

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Component = exports.Component;
    var ImageHolder = exports.ImageHolder;

    var ProgressBar = Class.create({
        superclass: Component,

        initialize: function() {
            this.composite = false;
            this.disabled = false;

            this.vertical = false;

            this.min = 0;
            this.max = 1;
            this.value = 1;
            this.totalLength = 100;

            this.progressInfo = null;
            this.progressHolder = null;
        },

        initHolders: function() {

            var Me = this;
            var progressInfo = this.progressInfo || {};

            var options = {
                parent: Me,

                width: "auto",
                height: "auto",
                alignH: this.vertical ? "center" : "left",
                alignV: this.vertical ? "bottom" : "center",
            };
            for (var p in progressInfo) {
                options[p] = progressInfo[p];
            }
            this.progressHolder = this.addImageHolder(options);

            var displayObject = this.progressHolder.displayObject;
            this.progressMaxX = displayObject.textureWidth;
            this.progressMaxY = displayObject.textureHeight;
        },

        setValue: function(value) {
            value = Math.min(Math.max(this.min, value), this.max);
            this.value = value;
            var p = (value - this.min) / (this.max - this.min);

            var displayObject = this.progressHolder.displayObject;
            var img = this.progressHolder.img;

            var renderer = this.root.renderer;
            if (this.vertical) {
                var h = p * this.progressMaxY;
                renderer.updateSprite(displayObject, 0, 0, null, h);
                this.progressHolder.height = h;
                this.progressHolder.updateSize();
            } else {
                var w = p * this.progressMaxX;
                renderer.updateSprite(displayObject, 0, 0, w, null);
                this.progressHolder.width = w;
                this.progressHolder.updateSize();
            }
            // console.log(value, w, h);

        },

        onChanged: function(value) {
            // console.log(value)
        },
    });

    exports.ProgressBar = ProgressBar;

}(CUI));
