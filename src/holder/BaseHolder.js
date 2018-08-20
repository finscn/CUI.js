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
            this.scale = 1;
            this.rotation = 0;
            this.tint = null;

            this.offsetX = 0;
            this.offsetY = 0;
            this.offsetAlpha = 0;

            this.alignH = "center"; // left center righ;
            this.alignV = "middle"; // top middle botto;

            this.visible = true;
            this.fillParent = false;

            this.ratio = null;
            this.lockScaleRatio = true;

            this.parent = null;
            this._needToCompute = true;
        },

        init: function() {
            this.setParent(this.parent);
            this.updateSize();
            this.updatePosition();
            this.initDisplayObject();
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
            var parent = this.parent;

            if (this.fillParent) {
                var width = parent._absoluteWidth;
                var height = parent._absoluteHeight;

                if (this.ratio !== null && this.lockScaleRatio) {
                    // debugger;
                    var _r = width / height;
                    if (_r >= this.ratio) {
                        width = height * this.ratio;
                    } else {
                        height = width / this.ratio;
                    }
                }

                this.pixel.width = width;
                this.pixel.height = height;
                this.absoluteWidth = width;
                this.absoluteHeight = height;

                this._sizeChanged = true;
                return;
            }

            if (this.width === 'auto') {

            } else {
                this.pixel.width = Utils.parseValue(this.width, parent._absoluteWidth, this.pixel.width) || 0;
            }
            this.absoluteWidth = this.pixel.width;

            if (this.height === 'auto') {

            } else {
                this.pixel.height = Utils.parseValue(this.height, parent._absoluteHeight, this.pixel.height) || 0;
            }
            this.absoluteHeight = this.pixel.height;

            this._sizeChanged = true;
        },

        updatePosition: function() {
            var parent = this.parent;

            if (this.fillParent) {
                var rx = this.offsetX;
                var ry = this.offsetY;

                if (this.ratio !== null && this.lockScaleRatio) {
                    rx = (parent._absoluteWidth - this._absoluteWidth) / 2;
                    ry = (parent._absoluteHeight - this._absoluteHeight) / 2;
                }

                this.pixel.relativeX = rx;
                this.pixel.relativeY = ry;
                this.absoluteX = this.pixel.x = parent._absoluteX + rx;
                this.absoluteY = this.pixel.y = parent._absoluteY + ry;

                this._positionChanged = true;

                return;
            }

            var x = 0;
            if (this.alignH === "center") {
                x = (parent._absoluteWidth - this.pixel.width) >> 1;
            } else if (this.alignH === "right") {
                x = parent._absoluteWidth - parent.pixel.paddingRight - this.pixel.width;
            } else {
                x = parent.pixel.paddingLeft;
            }
            this.pixel.relativeX = x + this.offsetX;
            this.pixel.x = parent._absoluteX + x;
            this.absoluteX = this.pixel.x;

            var y = 0;
            if (this.alignV === "middle" || this.alignV === "center") {
                y = (parent._absoluteHeight - this.pixel.height) >> 1;
            } else if (this.alignV === "bottom") {
                y = parent._absoluteHeight - parent.pixel.paddingBottom - this.pixel.height;
            } else {
                y = parent.pixel.paddingTop;
            }
            this.pixel.relativeY = y + this.offsetY;
            this.pixel.y = parent._absoluteY + y;
            this.absoluteY = this.pixel.y;

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
