"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var BaseLayout = exports.BaseLayout;

    var VBoxLayout = Class.create({
        constructor: VBoxLayout,

        compute: function(parent, children) {
            parent = parent || this.parent;
            children = children || parent.children;

            var idx = 0;
            var margin = parent.pixel.paddingTop;
            var currentY = 0;
            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                if (child.relative == "parent") {
                    this.computeChild(child, child.parent)
                } else if (child.relative == "root") {
                    this.computeChild(child, child.root)
                } else {
                    child.computeMargin(parent);
                    child.computeRealMargin(parent);
                    child.computeSize();
                    child.computePositionX(parent);

                    margin = Math.max(margin, child.pixel.marginTop);
                    var y = currentY + margin;
                    child.pixel.top = Utils.parseValue(child.top, child.pixel.realOuterHeight);
                    child.y = y + child.pixel.top + parent.y;

                    child.computePadding();
                    child.updateAABB();

                    currentY = y + child.pixel.height;
                    margin = child.pixel.marginBottom;
                    idx++;
                }
                child.computeLayout(true);

            }
            return idx;
        }

    }, BaseLayout);


    exports.VBoxLayout = VBoxLayout;

    if (typeof module != "undefined") {
        module.exports = VBoxLayout;
    }

}(CUI));
