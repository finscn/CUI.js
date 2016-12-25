"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var HBoxLayout = Class.create({
        superclass: BaseLayout,

        align: "left",
        size: null,
        equalSize: false,

        compute: function(parent) {
            var children = parent.children;
            var childCount = children.length;
            var idx = 0;
            var currentX = parent.pixel.paddingLeft;
            var margin = -Infinity;
            var totalHeight = 0;
            var size = this.size || (this.equalSize ? parent.pixel.innerWidth / childCount : this.size);
            var x;
            for (var i = 0; i < childCount; i++) {
                var child = children[i];
                child.hasLayoutX = false;
                if (child.relative == "parent") {
                    this.computeChild(child, child.parent)
                } else if (child.relative == "root") {
                    this.computeChild(child, child.root)
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

                    child.pixel.left = Utils.parseValue(child.left, child.pixel.realOuterWidth);
                    child.pixel.relativeX = x + child.pixel.left;
                    child.x = child.pixel.relativeX + parent.x;

                    child.hasLayoutX = true;
                    child.computePositionY(parent);
                    child.computePadding();
                    child.updateAABB();

                    margin = child.pixel.marginRight;
                    totalHeight = Math.max(totalHeight, child.pixel.marginTop + child.pixel.height + child.pixel.marginBottom)
                    idx++;
                }
                child.computeLayout(true);
            }

            var totalWidth = size ? parent.pixel.width : currentX + margin;
            this.tryToResizeParent(parent, totalWidth, totalHeight, true);
            if (!size && this.align == "right") {
                var deltaWidth = parent.pixel.width - totalWidth;
                if (deltaWidth > 0) {
                    for (var i = 0; i < childCount; i++) {
                        var child = children[i];
                        if (child.relative !== "parent" && child.relative != "root") {
                            child.pixel.left += deltaWidth;
                            child.pixel.relativeX += deltaWidth;
                            child.x += deltaWidth;
                            child.updateAABB();
                            child.computeLayout(true);
                        }
                    }
                }
            }
            return idx;
        }

    });


    exports.HBoxLayout = HBoxLayout;

    if (typeof module != "undefined") {
        module.exports = HBoxLayout;
    }

}(CUI));
