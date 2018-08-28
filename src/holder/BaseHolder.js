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

            // TODO
            this.offsetAlpha = 0;
            this.offsetWidth = 0;
            this.offsetHeight = 0;

            this.alignH = "center"; // left center righ;
            this.alignV = "middle"; // top center/middle bottom;

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

        computePositionX: function(parent) {
            parent = parent || this.parent;

            var x = 0;
            if (this.alignH === "center") {
                x = (parent._absoluteWidth - this._displayWidth) >> 1;
            } else if (this.alignH === "right") {
                x = parent._absoluteWidth - parent.pixel.paddingRight - this._displayWidth;
            } else {
                x = parent.pixel.paddingLeft;
            }
            this.pixel.baseX = x;

            this.syncPositionX();
        },

        computePositionY: function(parent) {
            parent = parent || this.parent;

            var y = 0;
            if (this.alignV === "middle" || this.alignV === "center") {
                y = (parent._absoluteHeight - this._displayHeight) >> 1;
            } else if (this.alignV === "bottom") {
                y = parent._absoluteHeight - parent.pixel.paddingBottom - this._displayHeight;
            } else {
                y = parent.pixel.paddingTop;
            }
            this.pixel.baseY = y;

            this.syncPositionY();
        },

        updatePosition: function() {
            var parent = this.parent;
            if (!parent) {
                return;
            }
            this.computePositionX(parent);
            this.computePositionY(parent);
        },

        update: function() {
            if (this._sizeChanged || this._positionChanged || this._needToCompute) {
                this.updateSize();
                this.updatePosition();

                this._sizeChanged = false;
                this._positionChanged = false;
                this._needToCompute = false;
            }
        },

        // syncDisplayWidth: function() {
        //     this._displayWidth = this._absoluteWidth * this._scaleX;
        //     this._pivotX = this._absoluteWidth * this._anchorX;
        //     if (this.displayObject) {
        //         this.displayObject.pivot.x = this._pivotX;
        //         this.displayObject.position.x = this.pixel.relativeX + this._pivotX;
        //         this.displayObject.scale.x = this._scaleX * (this._flipX ? -1 : 1);
        //     }
        // },

        syncDisplayWidth: function() {
            this._displayWidth = this._absoluteWidth * this._scaleX;
            this._pivotX = this._displayWidth * this._anchorX;
            if (this.displayObject) {
                if (!this.displayObject._ignoreResize) {
                    this.displayObject.width = this._displayWidth * (this._flipX ? -1 : 1);
                }
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
