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

        updatePosition: function() {
            var parent = this.parent;
            this.x = parent.x + parent.pixel.paddingLeft;
            this.y = parent.y + parent.pixel.paddingTop;
        },

        render: function(context, timeStep, now) {
            context.drawImage(this.img,
                this.sx, this.sy, this.sw, this.sh,
                this.x + this.ox, this.y + this.oy, this.pixel.width, this.pixel.height);
        },

    });


    exports.BackgroundImageHolder = BackgroundImageHolder;

    if (typeof module !== "undefined") {
        module.exports = BackgroundImageHolder;
    }

}(CUI));
