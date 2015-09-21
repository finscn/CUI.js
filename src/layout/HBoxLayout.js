"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var HBoxLayout = Class.create({
        constructor: HBoxLayout,

        align: "left",

        compute: function(parent) {
            var children = parent.children;

            var idx = 0;
            var currentX = 0;
            var margin = parent.pixel.paddingLeft;
            var totalHeight = 0;
            for (var i = 0, len = children.length; i < len; i++) {
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

                    margin = Math.max(margin, child.pixel.marginLeft);
                    var x = currentX + margin;
                    child.pixel.left = Utils.parseValue(child.left, child.pixel.realOuterWidth);
                    child.pixel.relativeX = x + child.pixel.left;
                    child.x = child.pixel.relativeX + parent.x;

                    currentX = x + child.pixel.width;
                    margin = child.pixel.marginRight;

                    child.hasLayoutX = true;
                    child.computePositionY(parent);
                    child.computePadding();
                    child.updateAABB();

                    totalHeight = Math.max(totalHeight, child.pixel.marginTop + child.pixel.height + child.pixel.marginBottom)
                    idx++;
                }
                child.computeLayout(true);
            }
            var totalWidth = currentX + margin;
            this.tryToResizeParent(parent, totalWidth, totalHeight);
            if (this.align == "right") {
                var deltaWidth = parent.pixel.width - totalWidth;
                if (deltaWidth > 0) {
                    for (var i = 0, len = children.length; i < len; i++) {
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

    }, BaseLayout);


    exports.HBoxLayout = HBoxLayout;

    if (typeof module != "undefined") {
        module.exports = HBoxLayout;
    }

}(CUI));
