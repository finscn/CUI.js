"use strict";

var CUI = CUI || {};

(function(exports) {
    var Class = exports.Class;
    var Utils = exports.Utils;
    // var BaseHolder = exports.BaseHolder;
    var ImageHolder = exports.ImageHolder;

    var BackgroundHolder = Class.create({
        // superclass: BaseHolder,
        superclass: ImageHolder,

        initialize: function() {
            this.width = "100%";
            this.height = "100%";

            this.color = null;
            this.alpha = 1;
        },

        init: function() {
            this.setParent(this.parent);
            this.updateSize();
            this.updatePosition();
            this.initDisplayObject();
        },

        initDisplayObject: function() {
            var displayObject = CUI.Utils.createRect(this.absoluteWidth, this.absoluteHeight, this.color, this.alpha);
            this.displayObject = displayObject;
            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

        updateSize: function() {
            if (this.fillParent) {
                this.pixel.width = this.parent._absoluteWidth;
                this.pixel.height = this.parent._absoluteHeight;
                this.absoluteWidth = this.pixel.width;
                this.absoluteHeight = this.pixel.height;
            }
        },

        updatePosition: function() {
            var parent = this.parent;
            this.absoluteX = parent._absoluteX + ((parent._absoluteWidth - this.pixel.width) >> 1) + this.ox + this.offsetX;
            this.absoluteY = parent._absoluteY + ((parent._absoluteHeight - this.pixel.height) >> 1) + this.oy + this.offsetY;
        },
    });


    exports.BackgroundHolder = BackgroundHolder;

    if (typeof module !== "undefined") {
        module.exports = BackgroundHolder;
    }

}(CUI));
