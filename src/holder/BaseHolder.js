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

            this.pixel = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                relativeX: 0,
                relativeY: 0,
            };

            this.absoluteX = 0;
            this.absoluteY = 0;
            this.width = null;
            this.height = null;
            this.anchorX = 0;
            this.anchorY = 0;

            this.alpha = 1;

            this.offsetX = 0;
            this.offsetY = 0;
            this.offsetAlpha = 0;

            this.alignH = "center"; // left center righ;
            this.alignV = "middle"; // top middle botto;

            this.visible = true;
            this.fillParent = false;

            this.parent = null;
            this._needToCompute = true;
        },

        init: function() {
            // this.setParent(this.parent);
            // this.initDisplayObject();
            // this.updateSize();
            // this.updatePosition();
        },

        initDisplayObject: function() {
            // do nothing.
        },
        updateDisplayObject: function(img, x, y, w, h) {
            // do nothing.
        },

        setParent: function(parent) {
            this.parent = parent;
            this.root = parent ? parent.root : null;
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
            this._sizeChanged = true;
        },

        updatePosition: function() {
            var parent = this.parent;

            if (this.fillParent) {
                this.absoluteX = this.pixel.x = parent.absoluteX;
                this.absoluteY = this.pixel.y = parent.absoluteY;
                this._positionChanged = true;
                return;
            }

            if (this.alignH === "center") {
                this.absoluteX = parent.absoluteX + ((parent.absoluteWidth - this.pixel.width) >> 1);
            } else if (this.alignH === "right") {
                this.absoluteX = parent.absoluteX + parent.absoluteWidth - parent.pixel.paddingRight - this.pixel.width;
            } else {
                this.absoluteX = parent.absoluteX + parent.pixel.paddingLeft;
            }
            this.absoluteX += this.offsetX + this.pixel.ox;

            if (this.alignV === "middle" || this.alignV === "center") {
                this.absoluteY = parent.absoluteY + ((parent.absoluteHeight - this.pixel.height) >> 1);
            } else if (this.alignV === "bottom") {
                this.absoluteY = parent.absoluteY + parent.absoluteHeight - parent.pixel.paddingBottom - this.pixel.height;
            } else {
                this.absoluteY = parent.absoluteY + parent.pixel.paddingTop;
            }
            this.absoluteY += this.offsetY + this.pixel.oy;

            this._positionChanged = true;
        },

        update: function() {
            this._sizeChanged = false;
            this._positionChanged = false;
        },

    });


    exports.BaseHolder = BaseHolder;

    if (typeof module !== "undefined") {
        module.exports = BaseHolder;
    }

}(CUI));
