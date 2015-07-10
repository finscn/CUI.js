"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var BaseLayout = exports.BaseLayout;

    var HBoxLayout = Class.create({
        constructor: HBoxLayout,

        owner: null,

        compute: function(parent, children) {
            parent = parent || this.parent;
            children = children || parent.children;

            var idx = 0;
            var margin = parent.pixel.paddingLeft;
            var currentX = 0;
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

                    margin = Math.max(margin, child.pixel.marginLeft);
                    var x = currentX + margin;
                    child.pixel.left = Utils.parseValue(child.left, child.pixel.realOuterWidth);
                    child.x = x + child.pixel.left + parent.x;

                    child.computePositionY(parent);
                    child.computePadding();
                    child.updateAABB();

                    currentX = x + child.pixel.width;
                    margin = child.pixel.marginRight;
                    idx++;
                }
                child.computeLayout(true);

            }
            return idx;
        }

    }, BaseLayout);


    exports.HBoxLayout = HBoxLayout;

    if (typeof module != "undefined") {
        module.exports = HBoxLayout;
    }

}(CUI));
