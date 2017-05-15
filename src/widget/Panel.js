"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var Label = exports.Label;
    var Button = exports.Button;


    var Panel = Class.create({
        superclass: Component,

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            Panel.$super.init.call(this);

            this.initHead();

            if (this.afterInit) {
                this.afterInit();
            }
        },

        initHead: function() {
            if (this.titleInfo) {
                if (!("left" in this.titleInfo)) {
                    this.titleInfo.left = 8;
                }
                if (!("top" in this.titleInfo)) {
                    this.titleInfo.top = 8;
                }
                this.titleInfo.fontSize = this.titleInfo.fontSize || 20;
                this.titleInfo.parent = this;
                this.titleLabel = new Label(this.titleInfo);
            }

            if (this.closeBtnInfo) {
                this.closeBtnInfo.parent = this;
                this.closeButton = new Button(this.closeBtnInfo);
            }
        },

        computeWidth: function() {
            var pixel = this.pixel;
            var autoWidth = this.width === null || this.width === "auto";
            var bg = this.backgroundHolder;

            if (autoWidth && !bg) {
                pixel.width = pixel.width || 0;
            } else if (autoWidth && bg) {
                pixel.width = bg.w;
            } else {
                pixel.width = Utils.parseValue(this.width, pixel.realOuterWidth);
            }
            pixel.anchorX = Utils.parseValue(this.anchorX, pixel.width) || 0;
            pixel.innerWidth = pixel.width - pixel.paddingLeft - pixel.paddingRight;
            this.w = pixel.width;
            if (bg && this.scaleBg) {
                // bg.pixel.width = this.w;
                bg.width = this.w;
            }
        },

        computeHeight: function() {
            var pixel = this.pixel;
            var autoHeight = this.height === null || this.height === "auto";
            var bg = this.backgroundHolder;

            if (autoHeight && !bg) {
                pixel.height = pixel.height || 0;
            } else if (autoHeight && bg) {
                pixel.height = bg.h;
            } else {
                pixel.height = Utils.parseValue(this.height, pixel.realOuterHeight);
            }
            pixel.anchorY = Utils.parseValue(this.anchorY, pixel.height) || 0;
            pixel.innerHeight = pixel.height - pixel.paddingTop - pixel.paddingBottom;
            this.h = pixel.height;

            if (bg && this.scaleBg) {
                // bg.pixel.height = this.h;
                bg.height = this.h;
            }
        },
    });

    exports.Panel = Panel;

    if (typeof module != "undefined") {
        module.exports = Panel;
    }

}(CUI));
