"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var Label = exports.Label;
    var Button = exports.Button;
    var Panel = exports.Panel;


    var TabPanel = Class.create({
        superclass: Panel,

        buttons: null,
        panels: null,
        currentTab: 0,
        defaultTab: 0,

        setTabs: function(buttons, panels, sync) {
            this.buttons = buttons || [];
            this.panels = panels || [];

            if (sync) {
                this.syncButtonTap();
            }
        },
        syncButtonTap: function() {
            var Me = this;
            if (!this.buttons) {
                return;
            }
            this.buttons.forEach(function(button, index) {
                button.tabPanel = Me;
                button.tabIndex = index;
                button.tabSelected = false;
                button.afterTap = Me.button_afterTap;

                var panel = Me.panels[index];
                if (panel) {
                    if (index === Me.defaultTab) {
                        Me.activateTab(index);
                    } else {
                        Me.inactivateTab(index);
                    }
                }
            });
        },

        activateTab: function(tabIndex) {
            if (this.currentTab !== null) {
                this.inactivateTab(this.currentTab);
            }

            var button = this.buttons[tabIndex];
            var panel = this.panels[tabIndex];

            button.tabSelected = true;
            if (button.activate) {
                button.activate();
            }
            panel.show();
            this.currentTab = tabIndex;
        },

        getActivedButton: function() {
            return this.buttons[this.currentTab] || null;
        },
        getActivedTab: function() {
            return this.panels[this.currentTab] || null;
        },
        inactivateTab: function(tabIndex) {
            if (this.currentTab === tabIndex) {
                this.currentTab = null;
            }
            if (tabIndex === null) {
                return;
            }

            var button = this.buttons[tabIndex];
            var panel = this.panels[tabIndex];

            button.tabSelected = false;
            if (button.inactivate) {
                button.inactivate();
            }
            panel.hide();
        },

        button_afterTap: function() {
            var button = this;
            var tabPanel = button.tabPanel;

            tabPanel.inactivateTab(tabPanel.currentTab);
            tabPanel.activateTab(button.tabIndex);
        }

    });

    exports.TabPanel = TabPanel;

    if (typeof module != "undefined") {
        module.exports = TabPanel;
    }

}(CUI));
