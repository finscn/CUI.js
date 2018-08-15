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
            var parent = this.parent;
            // this.x = parent.x;
            // this.y = parent.y;
            this.x = parent.x + ((parent.w - this.pixel.width) >> 1) + this.ox + this.offsetX;
            this.y = parent.y + ((parent.h - this.pixel.height) >> 1) + this.oy + this.offsetY;
        },

        updateSize: function() {
            if (this.parent && this.fillParent) {
                this.pixel.width = this.parent.pixel.width;
                this.pixel.height = this.parent.pixel.height;
                this.w = this.pixel.width;
                this.h = this.pixel.height;
            }
        },

        render: function(renderer, timeStep, now) {
            if (!this.visible || this.alpha === 0) {
                return false;
            }

            if (this.alpha !== 1) {
                renderer.setAlpha(this.alpha);
            }

            if (this.color !== null) {
                renderer.fillRect(this.x, this.y, this.w, this.h, this.color);
            }

            if (this.displayObject) {
                renderer.drawDisplayObject(this.displayObject,
                    this.x, this.y, this.w, this.h);
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
