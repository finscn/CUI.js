"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var Button = exports.Button;

    var SwitchButton = Class.create({
        superclass: Button,

        initialize: function() {
            this.tabIndex = 0;
            this.group = null;
            this.linkComp = null;

            this.active = false;

            this.bgImgNormal = null;
            this.bgImgActive = null;
            this.bgInfoNormal = null;
            this.bgInfoActive = null;
        },

        init: function() {
            this.id = this.id || "button_" + Component._SN++;

            var img = this.bgImgActive;
            var info = this.bgInfoActive;
            if (img && !info) {
                info = {
                    img: img
                };
            }
            this.bgInfoActive = info;

            var img = this.bgImgNormal;
            var info = this.bgInfoNormal;
            if (img && !info) {
                info = {
                    img: img
                };
            }
            this.bgInfoNormal = info;

            this.backgroundInfo = this.active ? this.bgInfoActive : this.bgInfoNormal;

            SwitchButton.$super.init.call(this);

        },

        activate: function(link) {
            if (this.active) {
                return;
            }

            if (this.linkComp) {
                var comp = this.linkComp;
                if (typeof comp === "string") {
                    comp = this.root.all[comp];
                }
                if (comp) {
                    comp.show();
                }
            }

            if (this.group) {
                var Me = this;
                this.group.forEach(function(tab) {
                    if (typeof tab === "string") {
                        tab = Me.root.all[tab];
                    }
                    if (tab && tab !== Me) {
                        tab.inactivate();
                    }
                });
            }

            this.active = true;
            this.onActivate(link);
            if (this.backgroundImageHolder) {
                this.backgroundImageHolder.setImageInfo(this.bgInfoActive);
            }
        },

        inactivate: function() {
            if (!this.active) {
                return;
            }
            if (this.linkComp) {
                var comp = this.linkComp;
                if (typeof comp === "string") {
                    comp = this.root.all[comp];
                }
                if (comp) {
                    comp.hide();
                }
            }
            this.active = false;
            this.onInactivate();
            if (this.backgroundImageHolder) {
                this.backgroundImageHolder.setImageInfo(this.bgInfoNormal);
            }
        },

        onTap: function(x, y, id) {
            this.activate();
        },
        onInactivate: function() {

        },
        onActivate: function() {

        },

    });

    exports.SwitchButton = SwitchButton;

    if (typeof module !== "undefined") {
        module.exports = SwitchButton;
    }

}(CUI));
