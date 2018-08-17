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
            this.absoluteX = parent.absoluteX + ((parent.absoluteWidth - this.pixel.width) >> 1) + this.ox + this.offsetX;
            this.absoluteY = parent.absoluteY + ((parent.absoluteHeight - this.pixel.height) >> 1) + this.oy + this.offsetY;
        },

        updateSize: function() {
            if (this.parent && this.fillParent) {
                this.pixel.width = this.parent.pixel.width;
                this.pixel.height = this.parent.pixel.height;
                this.absoluteWidth = this.pixel.width;
                this.absoluteHeight = this.pixel.height;
            }
        },
    });


    exports.BackgroundHolder = BackgroundHolder;

    if (typeof module !== "undefined") {
        module.exports = BackgroundHolder;
    }

}(CUI));
