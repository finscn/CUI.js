"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var BaseLayout = Class.create({
        constructor: BaseLayout,

        parent: null,

        compute: function(parent, children) {
            parent = parent || this.parent;
            children = children || parent.children;

            var idx = 0;
            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                if (child.relative == "parent") {
                    this.computeChild(child, child.parent)
                } else if (child.relative == "root") {
                    this.computeChild(child, child.root)
                } else {
                    this.computeChild(child, parent);
                }
                child.computeLayout(true);
            }
        },

        computeChild: function(child, parent) {
            child.computeSelf(parent);
        },

        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////


    });


    exports.BaseLayout = BaseLayout;

    if (typeof module != "undefined") {
        module.exports = BaseLayout;
    }

}(CUI));
