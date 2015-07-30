"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var VBoxLayout = Class.create({
        constructor: VBoxLayout,

        compute: function(parent) {
            var children = parent.children;

            var idx = 0;
            var currentY = 0;
            var margin = parent.pixel.paddingTop;
            var totalWidth = 0;
            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                if (child.relative == "parent") {
                    this.computeChild(child, child.parent)
                } else if (child.relative == "root") {
                    this.computeChild(child, child.root)
                } else {
                    child.computeMargin(parent);
                    child.computeRealMargin(parent);
                    child.computeWidth();
                    child.computeHeight();

                    child.computePositionX(parent);

                    margin = Math.max(margin, child.pixel.marginTop);
                    var y = currentY + margin;
                    child.pixel.top = Utils.parseValue(child.top, child.pixel.realOuterHeight);
                    child.pixel.relativeY = y + child.pixel.top;
                    child.y = child.pixel.relativeY + parent.y;

                    child.computePadding();
                    child.updateAABB();

                    currentY = y + child.pixel.height;
                    margin = child.pixel.marginBottom;
                    totalWidth = Math.max(totalWidth, child.pixel.marginLeft + child.pixel.width + child.pixel.marginRight)
                    idx++;
                }
                child.computeLayout(true);
            }
            var totalHeight = currentY + margin;
            this.tryToResizeParent(parent, totalWidth, totalHeight);
            return idx;
        }

    }, BaseLayout);


    exports.VBoxLayout = VBoxLayout;

    if (typeof module != "undefined") {
        module.exports = VBoxLayout;
    }

}(CUI));
