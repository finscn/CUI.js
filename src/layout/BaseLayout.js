"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var BaseLayout = Class.create({
        constructor: BaseLayout,

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

        tryToResizeParent: function(parent, width, height) {
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
                parent.computePositionX(parent.parent);
                parent.computePositionY(parent.parent);
                parent.computePadding();
                parent.updateAABB();
                parent.needToCompute = true;
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
