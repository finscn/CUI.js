"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Component = exports.Component;
    var Label = exports.Label;
    var Button = exports.Button;


    var Panel = Class.create({
        superclass: Component,

        init: function() {
            this.id = this.id || "panel_" + Core._SN++;

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.initBase();

            this.initHead();

            this.initChildren();

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
    });

    exports.Panel = Panel;

    if (typeof module !== "undefined") {
        module.exports = Panel;
    }

}(CUI));
