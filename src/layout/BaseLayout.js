"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var BaseLayout = Class.create({

        init: function() {

        },

        compute: function(parent) {
            var children = parent.children;

            var idx = 0;
            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                if (child.relative == "parent") {
                    this.computeChild(child, child.parent)
                } else if (child.relative == "root") {
                    this.computeChild(child, child.root)
                } else {
                    this.computeChild(child, parent);
                }
                child.computeLayout(true);
            }
        },

        computeChild: function(child, parent) {
            child.computeSelf(parent);
        },

        tryToResizeParent: function(parent, width, height, immediately) {
            var resize = false;
            if (parent.width == "auto" && !parent.w) {
                parent.pixel.width = width;
                parent.w = width;
                resize = true;
            }
            if (parent.height == "auto" && !parent.h) {
                parent.pixel.height = height;
                parent.h = height;
                resize = true;
            }
            if (resize) {
                parent.updateAnchor();
                if (!parent.hasLayoutX) {
                    parent.computePositionX(parent.parent);
                }
                if (!parent.hasLayoutY) {
                    parent.computePositionY(parent.parent);
                }
                parent.computePadding();
                parent.updateAABB();
                parent.needToCompute = true;
                if (immediately) {
                    parent.computeLayout();
                }
            }
        },

        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////

    });


    exports.BaseLayout = BaseLayout;

    if (typeof module != "undefined") {
        module.exports = BaseLayout;
    }

}(CUI));
