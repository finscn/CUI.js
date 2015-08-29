"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var Label = exports.Label;


    var Panel = Class.create({
        superclass: Component,

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            Panel.$super.init.call(this);

            if (this.titleInfo) {
                if (!("left" in this.titleInfo)) {
                    this.titleInfo.left = 8;
                }
                if (!("top" in this.titleInfo)) {
                    this.titleInfo.top = 8;
                }
                this.titleInfo.fontSize = this.titleInfo.fontSize || 20;

                this.titleLabel = new Label(this.titleInfo);
                this.titleLabel.parent = this;
                this.titleLabel.init();
            }
            if (this.closeBtnInfo) {
                this.closeButton = new Button(this.closeBtnInfo);
                this.closeButton.parent = this;
                this.closeButton.init();
            }

            if (this.afterInit) {
                this.afterInit();
            }
        },


        onTouchStart: function(x, y, id) {},

        onTouchMove: function(x, y, id) {},

        onTouchEnd: function(x, y, id) {},

        onTap: function(x, y, id) {},
    });

    exports.Panel = Panel;

    if (typeof module != "undefined") {
        module.exports = Panel;
    }

}(CUI));
