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

            this.fillParent = true;

            this.color = null;
            this.alpha = 1;
            this.lineWidth = 1;
        },

        initDisplayObject: function() {
            var displayObject = CUI.Utils.createRect(this.absoluteWidth, this.absoluteHeight, null, null, this.lineWidth, this.color, this.alpha);
            this.displayObject = displayObject;
            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

        update: function() {
            if (this._sizeChanged || this._positionChanged) {
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
