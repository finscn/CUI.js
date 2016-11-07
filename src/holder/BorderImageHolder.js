"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var ImageHolder = exports.ImageHolder;

    var BorderImageHolder = Class.create({

        T: null,
        R: null,
        B: null,
        L: null,

        fill: true,

        useCache: false,

        render: function(context, x, y, width, height, timeStep, now) {
            var bi = this;
            if (this.useCache) {
                if (!this.cacheCanvas) {
                    this.cacheCanvas = CUI.Utils.createImageByBorderImage(this.w, this.h,
                        bi.T, bi.R, bi.B, bi.L, bi.fill,
                        bi.img, bi.sx, bi.sy, bi.sw, bi.sh);
                }
                context.drawImage(this.cacheCanvas, x, y, width, height);
            } else {
                CUI.Utils.renderBorderImage(context,
                    x, y, width, height,
                    bi.T, bi.R, bi.B, bi.L, bi.fill,
                    bi.img, bi.sx, bi.sy, bi.sw, bi.sh)
            }
        },

    }, ImageHolder);


    exports.BorderImageHolder = BorderImageHolder;

    if (typeof module != "undefined") {
        module.exports = BorderImageHolder;
    }

}(CUI));
