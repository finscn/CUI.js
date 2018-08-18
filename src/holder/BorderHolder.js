"use strict";

var CUI = CUI || {};

(function(exports) {
    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseHolder = exports.BaseHolder;

    var BorderHolder = Class.create({
        superclass: BaseHolder,

        initialize: function() {
            // this.width = "100%";
            // this.height = "100%";

            this.color = null;
            this.alpha = 1;
            this.lineWidth = 1;
        },

        init: function() {
            this.setParent(this.parent);
            this.updateSize();
            this.updatePosition();
            this.initDisplayObject();
        },

        initDisplayObject: function() {
            var displayObject = CUI.Utils.createRect(this.absoluteWidth, this.absoluteHeight, null, null, this.lineWidth, this.color, this.alpha);
            this.displayObject = displayObject;
            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

        updateSize: function() {
            this.pixel.width = this.parent.pixel.width;
            this.pixel.height = this.parent.pixel.height;
            this.absoluteWidth = this.parent.absoluteWidth;
            this.absoluteHeight = this.parent.absoluteHeight;
            console.log(this.absoluteWidth, this.absoluteHeight);
            this._sizeChanged = true;
        },

        updatePosition: function() {
            this.absoluteX = this.parent.absoluteX;
            this.absoluteY = this.parent.absoluteY;
            this._positionChanged = true;
        },

        update: function() {
            if (this._sizeChanged || this._positionChanged) {
                console.log('update', this.displayObject, this.absoluteWidth, this.absoluteHeight, null, null, this.lineWidth, this.color, this.alpha);
                CUI.Utils.updateRect(this.displayObject, this.absoluteWidth, this.absoluteHeight, null, null, this.lineWidth, this.color, this.alpha);
                this._sizeChanged = false;
                this._positionChanged = false;
            }
        },
    });


    exports.BorderHolder = BorderHolder;

    if (typeof module !== "undefined") {
        module.exports = BorderHolder;
    }

}(CUI));
