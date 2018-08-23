"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var BaseHolder = Class.create({
        superclass: Core,

        initialize: function() {
            this.DEG_TO_RAD = Math.PI / 180;
            this.RAD_TO_DEG = 180 / Math.PI;
            this.HALF_PI = Math.PI / 2;
            this.DOUBLE_PI = Math.PI * 2;

            this.lazyInit = true;

            // TODO
            this.offsetAlpha = 0;
            this.offsetWidth = 0;
            this.offsetHeight = 0;

            this.alignH = "center"; // left center righ;
            this.alignV = "middle"; // top middle botto;

            this.fillParent = false;

            this.ratio = null;
            this.lockScaleRatio = true;

        },

        init: function() {
            this.initDisplayObject();
            // this.updateSize();
            // this.updatePosition();
        },

        computAutoWidth: function() {
            this.pixel.width = 0;
        },
        computAutoHeight: function() {
            this.pixel.height = 0;
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
                this.computAutoWidth();
            } else {
                this.pixel.width = Utils.parseValue(this.width, parent._absoluteWidth, this.pixel.width) || 0;
            }
            this.absoluteWidth = this.pixel.width;

            if (this.height === 'auto') {
                this.computAutoHeight();
            } else {
                this.pixel.height = Utils.parseValue(this.height, parent._absoluteHeight, this.pixel.height) || 0;
            }
            this.absoluteHeight = this.pixel.height;

            this._sizeChanged = true;
        },

        syncPositionX: function(parent) {
            parent = parent || this.parent;
            if (!parent) {
                return;
            }
            var pixel = this.pixel;

            pixel.relativeX = pixel.baseX + this._offsetX;
            pixel.x = pixel.relativeX + parent._absoluteX;
            this.absoluteX = pixel.x;
        },

        syncPositionY: function(parent) {
            parent = parent || this.parent;
            if (!parent) {
                return;
            }
            var pixel = this.pixel;

            pixel.relativeY = pixel.baseY + this._offsetY;
            pixel.y = pixel.relativeY + parent._absoluteY;
            this.absoluteY = pixel.y;
        },

        updatePosition: function() {
            var parent = this.parent;
            if (!parent) {
                return;
            }
            var pixel = this.pixel;

            if (this.fillParent) {
                if (this.ratio !== null && this.lockScaleRatio) {
                    pixel.baseX = (parent._absoluteWidth - this._absoluteWidth) / 2;
                    pixel.baseY = (parent._absoluteHeight - this._absoluteHeight) / 2;
                } else {
                    pixel.baseX = 0;
                    pixel.baseY = 0;
                }
            } else {
                var x = 0;
                if (this.alignH === "center") {
                    x = (parent._absoluteWidth - pixel.width) >> 1;
                } else if (this.alignH === "right") {
                    x = parent._absoluteWidth - parent.pixel.paddingRight - pixel.width;
                } else {
                    x = parent.pixel.paddingLeft;
                }
                pixel.baseX = x;

                var y = 0;
                if (this.alignV === "middle" || this.alignV === "center") {
                    y = (parent._absoluteHeight - pixel.height) >> 1;
                } else if (this.alignV === "bottom") {
                    y = parent._absoluteHeight - parent.pixel.paddingBottom - pixel.height;
                } else {
                    y = parent.pixel.paddingTop;
                }
                pixel.baseY = y;
            }

            this.syncPositionX(parent);
            this.syncPositionY(parent);

            this._positionChanged = true;
        },

        update: function() {
            this._sizeChanged = false;
            this._positionChanged = false;
        },

        syncDisplayWidth: function() {
            this._pivotX = this._absoluteWidth * this._anchorX;
            if (this.displayObject) {
                this.displayObject.width = this._absoluteWidth * this._scaleX * (this._flipX ? -1 : 1);
                this.displayObject.pivot.x = this._pivotX / this.displayObject.scale.x;
                this.displayObject.position.x = this.pixel.relativeX + this._pivotX;
            }
        },
        syncDisplayHeight: function() {
            this._pivotY = this._absoluteHeight * this._anchorY;
            if (this.displayObject) {
                this.displayObject.height = this._absoluteHeight * this._scaleY * (this._flipY ? -1 : 1);
                this.displayObject.pivot.y = this._pivotY / this.displayObject.scale.y;
                this.displayObject.position.y = this.pixel.relativeY + this._pivotY;
            }
        },
        destroy: function() {
            // TODO
            this.parent = null;
            this.displayObject.destroy();
            this.displayObject = null;
        }
    });

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////


    exports.BaseHolder = BaseHolder;

    if (typeof module !== "undefined") {
        module.exports = BaseHolder;
    }

}(CUI));
