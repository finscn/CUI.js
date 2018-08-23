"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var VBoxLayout = Class.create({
        superclass: BaseLayout,

        initialize: function() {
            this.align = "top";
            this.size = null;
            this.equalSize = false;
        },

        compute: function(parent) {
            var children = parent.children;
            var childCount = children.length;
            var idx = 0;

            var currentY = 0;
            var margin = parent.pixel.paddingTop;
            var totalWidth = 0;
            var size = this.equalSize ? parent.pixel.innerHeight / childCount : this.size;

            var y;
            for (var i = 0; i < childCount; i++) {
                var child = children[i];
                child.hasLayoutY = false;

                if (child.relative === "parent") {
                    this.computeChild(child, child.parent)
                } else {

                    child.computeMargin(parent);
                    child.computeRealMargin(parent);
                    child.computeWidth();
                    child.computeHeight();

                    if (!child.follow) {
                        y = currentY;
                        if (size) {
                            y += child.pixel.marginTop;
                            currentY += size;
                        } else {
                            y += Math.max(margin, child.pixel.marginTop);
                            currentY = y + child._absoluteHeight;
                        }
                    }

                    child.hasLayoutY = true;
                    child.pixel.realMarginTop = y;

                    child.computePositionX(parent);
                    child.computePositionY(parent);
                    child.computePadding();
                    child.updateAABB();

                    margin = child.pixel.marginBottom;
                    totalWidth = Math.max(totalWidth, child.pixel.marginLeft + child.pixel.width + child.pixel.marginRight)
                    idx++;
                }
                child.computeLayout(true);
            }

            if (childCount > 0) {
                var totalHeight = size ? parent._absoluteHeight : currentY + margin;
                this.tryToResizeParent(parent, totalWidth, totalHeight, true);
                if (!size && this.align === "bottom") {
                    var deltaHeight = parent._absoluteHeight - totalHeight;
                    if (deltaHeight > 0) {
                        for (var i = 0; i < childCount; i++) {
                            var child = children[i];
                            if (child.relative !== "parent") {
                                child.pixel.top += deltaHeight;
                                child.pixel.relativeY += deltaHeight;
                                child.pixel.y += deltaHeight;
                                child.absoluteY = child.pixel.y;
                                child.updateAABB();
                                child.computeLayout(true);
                            }
                        }
                    }
                }
            }
            return idx;
        },

    });


    exports.VBoxLayout = VBoxLayout;

    if (typeof module !== "undefined") {
        module.exports = VBoxLayout;
    }

}(CUI));
