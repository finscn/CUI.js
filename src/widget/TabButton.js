"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Button = exports.Button;

    var TabButton = Class.create({
        superclass: Button,

        initialize: function() {
            this.tabIndex = 0;
            this.group = null;
            this.linkComp = null;

            this.normalBg = "btn-normal";
            this.activeBg = "btn-active";
        },

        beforeInit: function() {
            if (typeof this.normalBg === "string") {
                this.bgNormal = Utils.getImageInfo(this.normalBg);
            } else {
                this.bgNormal = this.normalBg;
            }
            if (typeof this.activeBg === "string") {
                this.bgActive = Utils.getImageInfo(this.activeBg);
            } else {
                this.bgActive = this.activeBg;
            }

            this.bgInfo = this.active ? this.bgActive : this.bgNormal;
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
            this.setBackgroundInfo(this.bgActive);
            this.onActivate(link);
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
            this.setBackgroundInfo(this.bgNormal);
            this.onInactivate();
        },

        onTap: function(x, y, id) {
            this.activate();
        },
        onInactivate: function() {

        },
        onActivate: function() {

        },

    });

    exports.TabButton = TabButton;

    if (typeof module !== "undefined") {
        module.exports = TabButton;
    }

}(CUI));
