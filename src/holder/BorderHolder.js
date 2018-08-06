"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseHolder = exports.BaseHolder;

    var BorderHolder = Class.create({
        superclass: BaseHolder,

        initialize: function() {
            this.width = "100%";
            this.height = "100%";

            this.alpha = 1;
            this.lineWidth = 1;
            this.color = 0;
        },

        updateSize: function() {
            this.w = this.parent.w;
            this.h = this.parent.h;
        },

        updateSizeWithParentAABB: function() {
            var aabb = this.parent.aabb;
            var w = aabb[2] - aabb[0];
            var h = aabb[3] - aabb[1];
            this.w = w;
            this.h = h;
        },

        updatePosition: function() {
            this.x = this.parent.x;
            this.y = this.parent.y;
        },

        render: function(renderer, timeStep, now) {
            if (this.alpha > 0 && this.lineWidth > 0 && this.color !== null) {
                renderer.setAlpha(this.alpha);
                renderer.strokeRect(this.x, this.y, this.w, this.h, this.lineWidth, this.color);
                renderer.restoreAlpha();
            }
        },

    });


    exports.BorderHolder = BorderHolder;

    if (typeof module !== "undefined") {
        module.exports = BorderHolder;
    }

}(CUI));
