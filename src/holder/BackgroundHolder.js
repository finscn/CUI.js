"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var ImageHolder = exports.ImageHolder;

    var BackgroundHolder = Class.create({
        superclass: ImageHolder,

        initialize: function() {
            this.width = "100%";
            this.height = "100%";

            this.color = null;
            this.alpha = 1;
        },

        updatePosition: function() {
            this.x = this.parent.x;
            this.y = this.parent.y;
        },

        updateSize: function() {
            this.pixel.width = this.parent.pixel.width;
            this.pixel.height = this.parent.pixel.height;
        },

        render: function(renderer, timeStep, now) {
            if (!this.visible || this.alpha === 0) {
                return false;
            }

            if (this.alpha !== 1) {
                renderer.setAlpha(this.alpha);
            }

            var x = this.x + this.ox + this.offsetX;
            var y = this.y + this.oy + this.offsetY;

            if (this.color !== null) {
                renderer.fillRect(x, y, this.pixel.width, this.pixel.height, this.color);
            }

            if (this.displayObject) {
                renderer.drawDisplayObject(this.displayObject,
                    x, y, this.pixel.width, this.pixel.height);
            }

            if (this.alpha !== 1) {
                renderer.restoreAlpha();
            }
        },

    });


    exports.BackgroundHolder = BackgroundHolder;

    if (typeof module !== "undefined") {
        module.exports = BackgroundHolder;
    }

}(CUI));