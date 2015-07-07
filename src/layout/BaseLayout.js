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
            this.computeMargin(child, parent);
            this.computeRealMargin(child, parent);
            this.computeSize(child);
            this.computePositionX(child, parent);
            this.computePositionY(child, parent);
            this.computePadding(child);
            child.updateAABB();
        },

        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////

        computeMargin: function(comp, relativeComp) {
            // parent.pixel.width/height
            var relativePixel = relativeComp.pixel;
            var pixel = comp.pixel;
            comp.marginLeft = comp.marginLeft === null ? comp.margin : comp.marginLeft;
            comp.marginTop = comp.marginTop === null ? comp.margin : comp.marginTop;
            comp.marginRight = comp.marginRight === null ? comp.margin : comp.marginRight;
            comp.marginBottom = comp.marginBottom === null ? comp.margin : comp.marginBottom;

            pixel.marginLeft = Utils.parseValue(comp.marginLeft, relativePixel.width) || 0;
            pixel.marginRight = Utils.parseValue(comp.marginRight, relativePixel.width) || 0;
            pixel.marginTop = Utils.parseValue(comp.marginTop, relativePixel.height) || 0;
            pixel.marginBottom = Utils.parseValue(comp.marginBottom, relativePixel.height) || 0;
        },

        computeRealMargin: function(comp, relativeComp) {
            // parent.pixel.padding
            var relativePixel = relativeComp.pixel;
            var pixel = comp.pixel;
            pixel.realMarginLeft = Math.max(relativePixel.paddingLeft, pixel.marginLeft) || 0;
            pixel.realMarginTop = Math.max(relativePixel.paddingTop, pixel.marginTop) || 0;
            pixel.realMarginRight = Math.max(relativePixel.paddingRight, pixel.marginRight) || 0;
            pixel.realMarginBottom = Math.max(relativePixel.paddingBottom, pixel.marginBottom) || 0;
            pixel.realOuterWidth = relativePixel.width - pixel.realMarginLeft - pixel.realMarginRight;
            pixel.realOuterHeight = relativePixel.height - pixel.realMarginTop - pixel.realMarginBottom;
        },

        computeSize: function(comp) {
            // parent.pixel.innerWidth/innerHeight ( size - Math.max(padding, margin) );
            var pixel = comp.pixel;
            var relativeWidth = pixel.realOuterWidth;
            var relativeHeight = pixel.realOuterHeight;
            pixel.width = Utils.parseValue(comp.width, relativeWidth);
            pixel.height = Utils.parseValue(comp.height, relativeHeight);
            comp.w = pixel.width;
            comp.h = pixel.height;
        },

        computePositionX: function(comp, relativeComp) {
            // parent.pixel.innerWidth/innerHeight ( size - Math.max(padding, margin) );

            var pixel = comp.pixel;
            var relativeWidth = pixel.realOuterWidth;

            pixel.left = Utils.parseValue(comp.left, relativeWidth);
            pixel.right = Utils.parseValue(comp.right, relativeWidth);

            var x = 0;
            if (comp.centerX === true) {
                x = (relativeWidth - pixel.width) / 2;
            } else if (pixel.left === null && pixel.right !== null) {
                x = relativeWidth - pixel.width - pixel.right; // - pixel.marginRight;
            } else {
                x = pixel.left;
            }
            comp.x = x + pixel.realMarginLeft + relativeComp.x;
        },

        computePositionY: function(comp, relativeComp) {
            // parent.pixel.innerWidth/innerHeight ( size - Math.max(padding, margin) );

            var pixel = comp.pixel;
            var relativeHeight = pixel.realOuterHeight;

            pixel.top = Utils.parseValue(comp.top, relativeHeight);
            pixel.bottom = Utils.parseValue(comp.bottom, relativeHeight);

            var y = 0;
            if (comp.centerY === true) {
                y = (relativeHeight - pixel.height) / 2;
            } else if (pixel.top === null && pixel.bottom !== null) {
                y = relativeHeight - pixel.height - pixel.bottom;
            } else {
                y = pixel.top;
            }
            comp.y = y + pixel.realMarginTop + relativeComp.y;
        },

        computePadding: function(comp) {
            var pixel = comp.pixel;
            comp.paddingLeft = comp.paddingLeft === null ? comp.padding : comp.paddingLeft;
            comp.paddingTop = comp.paddingTop === null ? comp.padding : comp.paddingTop;
            comp.paddingRight = comp.paddingRight === null ? comp.padding : comp.paddingRight;
            comp.paddingBottom = comp.paddingBottom === null ? comp.padding : comp.paddingBottom;

            pixel.paddingLeft = Utils.parseValue(comp.paddingLeft, pixel.width) || 0;
            pixel.paddingRight = Utils.parseValue(comp.paddingRight, pixel.width) || 0;
            pixel.paddingTop = Utils.parseValue(comp.paddingTop, pixel.height) || 0;
            pixel.paddingBottom = Utils.parseValue(comp.paddingBottom, pixel.height) || 0;
        },

    });


    exports.BaseLayout = BaseLayout;

    if (typeof module != "undefined") {
        module.exports = BaseLayout;
    }

}(CUI));
