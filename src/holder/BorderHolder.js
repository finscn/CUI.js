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
            var displayObject = this.parent.root.renderer.createRect(this.absoluteWidth, this.absoluteHeight, null, null, this.lineWidth, this.color, this.alpha);
            this.displayObject = displayObject;
            this.syncDisplayObject();

            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

        update: function() {
            if (this._sizeChanged || this._positionChanged) {
                this.parent.root.renderer.updateRect(this.displayObject, 0, 0, this.absoluteWidth, this.absoluteHeight, null, null, this.lineWidth, this.color, this.alpha);
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
