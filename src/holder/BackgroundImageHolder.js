"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var ImageHolder = exports.ImageHolder;

    var BackgroundImageHolder = Class.create({
        superclass: ImageHolder,

        initialize: function() {
            this.width = "100%";
            this.height = "100%";
        },

        render: function(renderer, timeStep, now) {
            renderer.drawDisplayObject(this.displayObject,
                this.x + this.ox, this.y + this.oy, this.pixel.width, this.pixel.height);
        },

    });


    exports.BackgroundImageHolder = BackgroundImageHolder;

    if (typeof module != "undefined") {
        module.exports = BackgroundImageHolder;
    }

}(CUI));
