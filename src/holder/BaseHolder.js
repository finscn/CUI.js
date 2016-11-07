"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Font = exports.Font;

    var BaseHolder = Class.create({

        DEG_TO_RAD: Math.PI / 180,
        RAD_TO_DEG: 180 / Math.PI,
        HALF_PI: Math.PI / 2,
        DOUBLE_PI: Math.PI * 2,

        x: 0,
        y: 0,
        width: null,
        height: null,
        anchorX: 0,
        anchorY: 0,

        alpha: 1,

        offsetX: 0,
        offsetY: 0,
        offsetAlpha: 0,

        alignH: "center", // left center right
        alignV: "middle", // top middle bottom

        visible: true,

        parent: null,
        needToCompute: true,

        init: function() {
            this.setParent(this.parent);
        },

        setParent: function(parent) {
            this.parent = parent;
            this.needToCompute = true;
        },

        setAnchor: function(x, y) {
            this.anchorX = x;
            this.anchorY = y;
        },

        setOffset: function(x, y) {
            this.offsetX = x;
            this.offsetY = y;
        },

        updateSize: function() {

        },

        updatePosition: function() {
            var parent = this.parent;
            if (this.alignH == "center") {
                this.x = parent.x + ((parent.w - this.pixel.width) >> 1);
            } else if (this.alignH == "right") {
                this.x = parent.x + parent.w - parent.pixel.paddingRight - this.pixel.width;
            } else {
                this.x = parent.x + parent.pixel.paddingLeft;
            }

            if (this.alignV == "middle" || this.alignV == "center") {
                this.y = parent.y + ((parent.h - this.pixel.height) >> 1);
            } else if (this.alignV == "bottom") {
                this.y = parent.y + parent.h - parent.pixel.paddingBottom - this.pixel.height;
            } else {
                this.y = parent.y + parent.pixel.paddingTop;
            }
        },

        render: function(renderer, timeStep, now) {
            if (!this.visible) {
                return false;
            }
        },

    });


    exports.BaseHolder = BaseHolder;

    if (typeof module != "undefined") {
        module.exports = BaseHolder;
    }

}(CUI));
