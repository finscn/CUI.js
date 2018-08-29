"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var BaseHolder = exports.BaseHolder;

    var BorderImageHolder = Class.create({
        superclass: BaseHolder,

        initialize: function() {
            this.width = "100%";
            this.height = "100%";

            this.borderImage = true;

            this.T = null;
            this.R = null;
            this.B = null;
            this.L = null;

            this.alpha = 1;
            this.fillParent = true;
        },

        init: function() {
            this.config = {
                sx: this.sx,
                sy: this.sy,
                sw: this.sw,
                sh: this.sh,
            };

            this.initDisplayObject();
            // this.updateSize();
            // this.updatePosition();
        },

        initDisplayObject: function() {
            var img = this.img;
            var config = this.config;
            var sx = config.sx || 0;
            var sy = config.sy || 0;
            var sw = config.sw || img.width;
            var sh = config.sh || img.height;

            var L = this.L;
            var T = this.T;
            var R = this.R;
            var B = this.B;

            this.displayObject = this.parent.root.renderer.createNineSlicePlane(img, sx, sy, sw, sh, L, T, R, B);
            this.syncDisplayObject();

            this.displayObject.width = sw;
            this.displayObject.height = sh;

            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },


    });


    exports.BorderImageHolder = BorderImageHolder;

    if (typeof module !== "undefined") {
        module.exports = BorderImageHolder;
    }

}(CUI));
