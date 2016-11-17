"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var ImageHolder = exports.ImageHolder;

    var BackgroundImageHolder = Class.create({

        width: "100%",
        height: "100%",

        render: function(context, timeStep, now) {
            context.drawImage(this.img,
                this.sx, this.sy, this.sw, this.sh,
                this.x + this.ox, this.y + this.oy, this.pixel.sw, this.pixel.sh);
        },

    }, ImageHolder);


    exports.BackgroundImageHolder = BackgroundImageHolder;

    if (typeof module != "undefined") {
        module.exports = BackgroundImageHolder;
    }

}(CUI));
