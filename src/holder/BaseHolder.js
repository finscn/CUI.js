"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Font = exports.Font;

    var BaseHolder = Class.create({

        initialize: function() {
            this.DEG_TO_RAD = Math.PI / 180;
            this.RAD_TO_DEG = 180 / Math.PI;
            this.HALF_PI = Math.PI / 2;
            this.DOUBLE_PI = Math.PI * 2;

            this.x = 0;
            this.y = 0;
            this.width = null;
            this.height = null;
            this.anchorX = 0;
            this.anchorY = 0;

            this.alpha = 1;

            this.offsetX = 0;
            this.offsetY = 0;
            this.offsetAlpha = 0;

            this.alignH = "center", // left center righ;
            this.alignV = "middle", // top middle botto;

            this.visible = true;

            this.parent = null;
            this._needToCompute = true;
        },

        init: function() {
            this.setParent(this.parent);
        },

        setParent: function(parent) {
            this.parent = parent;
            this._needToCompute = true;
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
            if (this.alignH === "center") {
                this.x = parent.x + ((parent.w - this.pixel.width) >> 1);
            } else if (this.alignH === "right") {
                this.x = parent.x + parent.w - parent.pixel.paddingRight - this.pixel.width;
            } else {
                this.x = parent.x + parent.pixel.paddingLeft;
            }

            if (this.alignV === "middle" || this.alignV === "center") {
                this.y = parent.y + ((parent.h - this.pixel.height) >> 1);
            } else if (this.alignV === "bottom") {
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

    if (typeof module !== "undefined") {
        module.exports = BaseHolder;
    }

}(CUI));
