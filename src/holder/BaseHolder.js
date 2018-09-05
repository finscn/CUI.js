"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var BaseHolder = Class.create({
        superclass: Core,

        initialize: function() {

            this.lazyInit = true;

            this.alignH = "center";
            this.alignV = "center";

            // TODO
            this.offsetAlpha = 0;
            this.offsetWidth = 0;
            this.offsetHeight = 0;

            this.fillParent = false;

            this.ratio = null;
            this.lockScaleRatio = true;
        },

        init: function() {
            this.initDisplayObject();
            // this.updateSize();
            // this.updatePosition();
        },

        computeAutoWidth: function() {
            this.pixel.width = 0;
        },
        computeWidth: function() {
            var parent = this.parent;
            if (this._width === "auto") {
                this.computeAutoWidth();
            } else {
                this.pixel.width = Utils.parseValue(this.width, parent._absoluteWidth, this.pixel.width) || 0;
            }
            this.absoluteWidth = this.pixel.width;
        },

        computeAutoHeight: function() {
            this.pixel.height = 0;
        },
        computeHeight: function() {
            var parent = this.parent;
            if (this._height === "auto") {
                this.computeAutoHeight();
            } else {
                this.pixel.height = Utils.parseValue(this.height, parent._absoluteHeight, this.pixel.height) || 0;
            }
            this.absoluteHeight = this.pixel.height;
        },

        updateSize: function() {
            this.computeWidth();
            this.computeHeight();
            this._sizeChanged = true;
        },

        computePositionX: function(parent) {
            parent = parent || this.parent;

            var pixel = this.pixel;
            var relativeWidth = parent._absoluteWidth;

            var x = 0;
            pixel.left = Utils.parseValue(this.left, relativeWidth);
            pixel.right = Utils.parseValue(this.right, relativeWidth);
            if (this.alignH === "center") {
                x = (relativeWidth - this._displayWidth) / 2 + (pixel.left || 0);
            } else if (this.alignH === "right") {
                x = (relativeWidth - parent.pixel.paddingRight - this._displayWidth) + (pixel.left || 0);
            } else if (pixel.left === null && pixel.right !== null) {
                x = (relativeWidth - parent.pixel.paddingRight - this._displayWidth) - (pixel.right || 0);
            } else {
                x = parent.pixel.paddingLeft + (pixel.left || 0);
            }
            pixel.baseX = x;

            this.syncPositionX(parent);
        },

        computePositionY: function(parent) {
            parent = parent || this.parent;

            var pixel = this.pixel;
            var relativeHeight = parent._absoluteHeight;

            var y = 0;
            pixel.top = Utils.parseValue(this.top, relativeHeight);
            pixel.bottom = Utils.parseValue(this.bottom, relativeHeight);
            if (this.alignV === "center" || this.alignV === "middle") {
                y = (relativeHeight - this._displayHeight) / 2 + (pixel.top || 0);
            } else if (this.alignV === "bottom") {
                y = (relativeHeight - parent.pixel.paddingBottom - this._displayHeight) + (pixel.top || 0);
            } else if (pixel.top === null && pixel.bottom !== null) {
                y = (relativeHeight - parent.pixel.paddingBottom - this._displayHeight) - (pixel.bottom || 0);
            } else {
                y = parent.pixel.paddingTop + (pixel.top || 0);
            }
            pixel.baseY = y;

            this.syncPositionY(parent);
        },

        syncPositionX: function(parent) {
            parent = parent || this.parent;
            var pixel = this.pixel;
            pixel.relativeX = pixel.baseX + this._offsetX;
            pixel.x = pixel.relativeX + (parent ? parent._absoluteX : 0);
            this.absoluteX = pixel.x;
        },

        syncPositionY: function(parent) {
            parent = parent || this.parent;
            var pixel = this.pixel;
            pixel.relativeY = pixel.baseY + this._offsetY;
            pixel.y = pixel.relativeY + (parent ? parent._absoluteY : 0);
            this.absoluteY = pixel.y;
        },

        updatePosition: function() {
            var parent = this.parent;
            if (!parent) {
                return;
            }
            this.computePositionX(parent);
            this.computePositionY(parent);
        },

        update: function(forceCompute) {
            if (this._sizeChanged || this._positionChanged || this._needToCompute || forceCompute) {
                this.updateSize();
                this.updatePosition();

                this._sizeChanged = false;
                this._positionChanged = false;
                this._needToCompute = false;
            }
        },

        syncDisplayWidth: function() {
            this._displayWidth = this._absoluteWidth * this._scaleX;
            this._pivotX = this._displayWidth * this._anchorX;
            if (this.displayObject) {
                if (!this.displayObject._ignoreResize) {
                    this.displayObject.width = this._displayWidth * (this._flipX ? -1 : 1);
                }
                this.displayObject._flipX = this._flipX;
                this.displayObject.pivot.x = this._pivotX / Math.abs(this.displayObject.scale.x);
                this.displayObject.position.x = this.pixel.relativeX + this._pivotX;
            }
        },
        syncDisplayHeight: function() {
            this._displayHeight = this._absoluteHeight * this._scaleY;
            this._pivotY = this._displayHeight * this._anchorY;
            if (this.displayObject) {
                if (!this.displayObject._ignoreResize) {
                    this.displayObject.height = this._displayHeight * (this._flipY ? -1 : 1);
                }
                this.displayObject._flipY = this._flipY;
                this.displayObject.pivot.y = this._pivotY / Math.abs(this.displayObject.scale.y);
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
