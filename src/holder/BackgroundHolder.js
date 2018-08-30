"use strict";

var CUI = CUI || {};

(function(exports) {
    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseHolder = exports.BaseHolder;

    var BackgroundHolder = Class.create({
        superclass: BaseHolder,

        initialize: function() {
            this.width = "100%";
            this.height = "100%";

            this.color = null;
            this.alpha = 1;

            this.fillParent = true;
        },

        initDisplayObject: function() {
            var displayObject = this.parent.root.renderer.createRect(this.absoluteWidth, this.absoluteHeight, this.color, this.alpha);
            this.displayObject = displayObject;
            this.syncDisplayObject();
            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

        update: function(forceCompute) {
            if (this.parent._sizeChanged || this._sizeChanged || this._positionChanged || this._needToCompute || forceCompute) {
                this.updateSize();
                this.updatePosition();

                this.parent.root.renderer.updateRect(this.displayObject, 0, 0, this.absoluteWidth, this.absoluteHeight, this.color, this.alpha);

                this._sizeChanged = false;
                this._positionChanged = false;
                this._needToCompute = false;
            }
        },
    });


    exports.BackgroundHolder = BackgroundHolder;

    if (typeof module !== "undefined") {
        module.exports = BackgroundHolder;
    }

}(CUI));
