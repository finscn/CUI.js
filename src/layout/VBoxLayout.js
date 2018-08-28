"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var VBoxLayout = Class.create({
        superclass: BaseLayout,

        initialize: function() {
            this.flexible = true;

            this.align = "top";
            this.size = null;
            this.equalSize = false;
        },

        compute: function(parent) {
            // console.log('VBoxLayout.compute');
            var children = parent.children;
            var childCount = children.length;
            var idx = 0;

            if (childCount === 0) {
                return idx;
            }

            var parentPixel = parent.pixel;
            var margin = parentPixel.paddingTop;
            var totalWidth = 0;
            var size = this.equalSize ? parentPixel.realOuterHeight / childCount : this.size;

            var alignBottom = !size && this.align === "bottom";

            var y = 0;
            var currentY = 0;
            for (var i = 0; i < childCount; i++) {
                var child = children[i];

                if (child.relative === "parent") {
                    // child.computeSelf(parent)
                } else {
                    if (child.follow) {
                        // y is same to previous
                    } else {
                        y = currentY;
                        if (size) {
                            y += child.pixel.marginTop;
                            currentY += size;
                        } else {
                            y += Math.max(margin, child.pixel.marginTop);
                            currentY = y + child._absoluteHeight;
                        }
                    }

                    child._movedY = true;
                    child.pixel.baseY = y;
                    if (!alignBottom) {
                        this.computeChild(child);
                    }

                    margin = child.pixel.marginBottom;
                    idx++;

                    var rightSpace = Math.max(parentPixel.paddingRight, child.pixel.marginRight);
                    totalWidth = Math.max(totalWidth, child.pixel.relativeX + child._absoluteWidth + rightSpace);
                    if (i + 1 === childCount) {
                        margin = Math.max(margin, parentPixel.paddingBottom)
                    }
                }
            }

            var totalHeight = size ? parent._absoluteHeight : currentY + margin;

            this.tryToResizeParent(parent, totalWidth, totalHeight);

            if (alignBottom) {
                var topSpace = parentPixel.height - totalHeight;
                for (var i = 0; i < childCount; i++) {
                    var child = children[i];
                    if (child.relative !== "parent") {
                        child.pixel.baseY += topSpace;
                        this.computeChild(child);
                    }
                }
            }
            return idx;
        },

        computeChild: function(child) {
            child.syncPositionY();
            child.updateAABB();
            if (child.composite) {
                child.children.forEach(function(child) {
                    child.syncPosition();
                });
            }
        }
    });


    exports.VBoxLayout = VBoxLayout;

    if (typeof module !== "undefined") {
        module.exports = VBoxLayout;
    }

}(CUI));
