"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var HBoxLayout = Class.create({
        superclass: BaseLayout,

        initialize: function() {
            this.flexible = true;

            this.align = "left";
            this.size = null;
            this.equalSize = false;
        },

        compute: function(parent) {
            // console.log('HBoxLayout.compute', parent.id, parent.name);
            var children = parent.children;
            var childCount = children.length;
            if (childCount === 0) {
                return;
            }

            var idx = 0;
            var parentPixel = parent.pixel;
            var margin = parentPixel.paddingLeft;
            var totalHeight = 0;
            var size = this.equalSize ? parentPixel.realOuterHeight / childCount : this.size;

            var alignRight = !size && this.align === "right";

            var x = 0;
            var currentX = 0;
            for (var i = 0; i < childCount; i++) {
                var child = children[i];

                if (child.ignoreLayout !== true) {
                    if (child.follow) {
                        // x is same to previous
                    } else {
                        x = currentX;
                        if (size) {
                            x += child.pixel.marginLeft;
                            currentX += size;
                        } else {
                            x += Math.max(margin, child.pixel.marginLeft);
                            currentX = x + child._absoluteWidth;
                        }
                    }

                    child._movedX = true;
                    child.pixel.baseX = x;
                    if (!alignRight) {
                        this.computeChild(child);
                    }

                    margin = child.pixel.marginRight;
                    idx++;

                    var bottomSpace = Math.max(parentPixel.paddingBottom, child.pixel.marginBottom);
                    totalHeight = Math.max(totalHeight, child.pixel.relativeY + child._absoluteHeight + bottomSpace);

                    if (i + 1 === childCount) {
                        margin = Math.max(margin, parentPixel.paddingRight)
                    }
                }
            }

            var totalWidth = size ? parent._absoluteWidth : currentX + margin;

            this.tryToResizeParent(parent, totalWidth, totalHeight);

            if (alignRight) {
                var leftSpace = parentPixel.width - totalWidth;
                for (var i = 0; i < childCount; i++) {
                    var child = children[i];
                    if (child.ignoreLayout !== true) {
                        child.pixel.baseX += leftSpace;
                        this.computeChild(child);
                    }
                }
            }

            return idx;
        },

        computeChild: function(child) {
            child.syncPositionX();
            child.updateAABB();
            if (child.composite) {
                child.children.forEach(function(child) {
                    child.syncPosition();
                });
            }
        }

    });


    exports.HBoxLayout = HBoxLayout;

    if (typeof module !== "undefined") {
        module.exports = HBoxLayout;
    }

}(CUI));
