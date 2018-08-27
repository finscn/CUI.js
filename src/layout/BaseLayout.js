"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var BaseLayout = Class.create({

        initialize: function() {
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
            var children = parent.children;

            var idx = 0;
            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                if (child.relative === "parent") {
                    child.computeSelf(parent);
                } else {
                    child.computeSelf(parent);
                }
                child.computeLayout(true);
            }
        },

        tryToResizeParent: function(parent, width, height, immediately) {
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
                if (!parent.hasLayoutX) {
                    parent.computePositionX(parent.parent);
                }
                if (!parent.hasLayoutY) {
                    parent.computePositionY(parent.parent);
                }
                parent.computePadding();
                parent.updateAABB();
                parent._needToCompute = true;
                if (immediately) {
                    parent.computeLayout();
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
