"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var ImageHolder = exports.ImageHolder;

    var BackgroundImageHolder = Class.create({

        render: function(context, x, y, width, height, timeStep, now) {
            context.drawImage(this.img,
                this.sx, this.sy, this.sw, this.sh,
                x + this.ox, y + this.oy, width, height);
        },

    }, ImageHolder);


    exports.BackgroundImageHolder = BackgroundImageHolder;

    if (typeof module != "undefined") {
        module.exports = BackgroundImageHolder;
    }

}(CUI));
