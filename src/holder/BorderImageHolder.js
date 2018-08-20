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

        initDisplayObject: function(width, height) {
            var img = this.img;
            var config = this.config;
            var sx = config.sx || 0;
            var sy = config.sy || 0;
            var sw = config.sw || img.width;
            var sh = config.sh || img.height;

            var T = this.T;
            var R = this.R;
            var B = this.B;
            var L = this.L;

            this.displayObject = CUI.Utils.createNineSlicePlane(img, sx, sy, sw, sh, T, R, B, L);
            this.displayObject.width = sw;
            this.displayObject.height = sh;
        },
    });


    exports.BorderImageHolder = BorderImageHolder;

    if (typeof module !== "undefined") {
        module.exports = BorderImageHolder;
    }

}(CUI));
