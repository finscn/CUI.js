"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var BaseLayout = Class.create({

        initialize: function() {
            this.lazyInit = false;
            this.flexible = false;

            this.pixel = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                baseX: 0,
                baseY: 0,
                relativeX: 0,
                relativeY: 0,
            };
        },

        init: function() {

        },

        compute: function(parent) {
            // console.log('BaseLayout.compute');
            var children = parent.children;
            var childCount = children.length;
            var idx = 0;

            if (childCount === 0) {
                return idx;
            }

            var parentPixel = parent.pixel;
            var totalWidth = 0;
            var totalHeight = 0;
            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                // child.computeSelf(parent);

                var rightSpace = Math.max(parent.pixel.paddingRight, child.pixel.marginRight);
                totalWidth = Math.max(totalWidth, child.pixel.relativeX + child._absoluteWidth + rightSpace);

                var bottomSpace = Math.max(parentPixel.paddingBottom, child.pixel.marginBottom);
                totalHeight = Math.max(totalHeight, child.pixel.relativeY + child._absoluteHeight + bottomSpace);

                // child.computeLayout(true);
            }

            this.tryToResizeParent(parent, totalWidth, totalHeight);
        },

        tryToResizeParent: function(parent, width, height) {
            var resize = false;
            if (parent._width === "auto" && parent._absoluteWidth !== width) {
                parent.pixel.width = width;
                parent.absoluteWidth = width;
                resize = true;
            }
            if (parent._height === "auto" && parent._absoluteHeight !== height) {
                parent.pixel.height = height;
                parent.absoluteHeight = height;
                resize = true;
            }
            if (resize) {
                parent.computePositionX();
                parent.computePositionY();
                parent.computePadding();
                parent.updateAABB();
                if (parent.composite) {
                    parent.children.forEach(function(child) {
                        child.syncPosition();
                    });
                }
            }
        },

        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////

    });


    exports.BaseLayout = BaseLayout;

    if (typeof module !== "undefined") {
        module.exports = BaseLayout;
    }

}(CUI));
