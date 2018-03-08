"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var noop = exports.noop;

    var Cursor = Class.create({

        initialize: function() {
            this.lazyInit = false;
            this.focusButton = null;
            this.focusId = 0;
            this.defaultFocusId = 0;

            this.cyclic = true;
            this.disabled = true;

            this.color = "#FF7F00";
            this.ui = null;
            this.navTree = null;
        },

        init: function() {
            if (this.defaultFocusId) {
                this.setFocus(this.defaultFocusId);
            }
            if (this.onInit) {
                this.onInit();
            }
        },
        onInit: null,

        enable: function() {
            this.disabled = false;
        },
        disable: function() {
            this.disabled = true;
        },
        reset: function() {
            this.lastFocusButton = null;
            this.lastFocusId = null;
            this.focusButton = null;
            this.focusId = null;
        },

        tap: function() {
            var btn = this.focusButton;
            if (!btn || btn.disabled) {
                return false;
            }
            var id = 123;
            var x = btn.x + 1,
                y = btn.y + 1;
            btn.touchStart(x, y, id);
            setTimeout(function() {
                btn.touchEnd(x, y, id);
                btn.tap(x, y, id);
            }, 100);
            return true;
        },
        nav: function(flag) {
            var btn = this.focusButton;
            if (!btn || !this.navTree) {
                return false;
            }
            var btnNav = this.navTree[btn.id];
            if (btnNav && btnNav[flag]) {
                var id = btnNav[flag];
                if (id === -1) {
                    id = this.lastFocusId;
                }
                this.setFocus(id);
            }
        },
        back: function() {
            this.setFocus(this.lastFocusId);
        },

        up: function() {
            this.nav(0);
        },
        right: function() {
            this.nav(1);
        },
        down: function() {
            this.nav(2);
        },
        left: function() {
            this.nav(3);
        },

        focusOnDefault: function() {
            this.setFocus(this.defaultFocusId);
        },
        setFocus: function(id) {
            var btn = this.ui.all[id];
            if (!btn) {
                return false;
            }
            this.lastFocusButton = this.focusButton;
            this.lastFocusId = this.focusId;
            this.onBlur(this.focusButton);

            this.focusButton = btn;
            this.focusId = id;
            this.onFocus(btn);
            return true;
        },
        onFocus: function(btn) {

        },
        onBlur: function(btn) {

        },
        render: function(renderer, timeStep, now) {
            var btn = this.focusButton;
            if (!btn) {
                return;
            }
            var lineWidth = 4;
            renderer.strokeRect(btn.x - 4, btn.y - 4, btn.w + 8, btn.h + 8, lineWidth, this.color);
        },

    });

    exports.Cursor = Cursor;

}(CUI));
