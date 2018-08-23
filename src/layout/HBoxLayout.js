"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var HBoxLayout = Class.create({
        superclass: BaseLayout,

        initialize: function() {
            this.align = "left";
            this.size = null;
            this.equalSize = false;
        },

        compute: function(parent) {
            // console.log('HBoxLayout.compute');
            var children = parent.children;
            var childCount = children.length;
            var idx = 0;

            var currentX = 0;
            var margin = parent.pixel.paddingLeft;
            var totalHeight = 0;
            var size = this.size || (this.equalSize ? parent.pixel.innerWidth / childCount : this.size);

            var x;
            for (var i = 0; i < childCount; i++) {
                var child = children[i];
                child.hasLayoutX = false;
                if (child.relative === "parent") {
                    this.computeChild(child, child.parent)
                } else {
                    child.computeMargin(parent);
                    child.computeRealMargin(parent);
                    child.computeWidth();
                    child.computeHeight();

                    if (!child.follow) {
                        x = currentX;
                        if (size) {
                            x += child.pixel.marginLeft;
                            currentX += size;
                        } else {
                            x += Math.max(margin, child.pixel.marginLeft);
                            currentX = x + child.pixel.width;
                        }
                    }

                    child.hasLayoutX = true;
                    child.pixel.realMarginLeft = x;

                    child.computePositionX(parent);
                    child.computePositionY(parent);
                    child.computePadding();
                    child.updateAABB();

                    margin = child.pixel.marginRight;
                    totalHeight = Math.max(totalHeight, child.pixel.marginTop + child.pixel.height + child.pixel.marginBottom)
                    idx++;
                }
                child.computeLayout(true);
            }

            if (childCount > 0) {
                var totalWidth = size ? parent._absoluteWidth : currentX + margin;
                this.tryToResizeParent(parent, totalWidth, totalHeight, true);
                if (!size && this.align === "right") {
                    var deltaWidth = parent._absoluteWidth - totalWidth;
                    if (deltaWidth > 0) {
                        for (var i = 0; i < childCount; i++) {
                            var child = children[i];
                            if (child.relative !== "parent") {
                                child.pixel.left += deltaWidth;
                                child.pixel.baseX += deltaWidth;
                                child.pixel.relativeX += deltaWidth;
                                child.pixel.x += deltaWidth;
                                child.absoluteX = child.pixel.x;
                                child.updateAABB();
                                child.computeLayout(true);
                            }
                        }
                    }
                }
            }
            return idx;
        }

    });


    exports.HBoxLayout = HBoxLayout;

    if (typeof module !== "undefined") {
        module.exports = HBoxLayout;
    }

}(CUI));
