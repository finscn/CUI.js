"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Composite = exports.Composite;
    var Component = exports.Component;
    var noop = exports.noop;

    var Root = Class.create({
        superclass: Component,

        initialize: function() {
            this.renderer = null;

            this.left = null;
            this.top = null;
            this.originalX = 0;
            this.originalY = 0;
        },

        updateSelf: noop,
        checkTouchSelf: noop,

        init: function() {
            this.id = this.id || "root_" + Core._SN++;

            this.root = this;

            if (this.left === null) {
                this.left = this.originalX;
            }
            if (this.top === null) {
                this.top = this.originalY;
            }

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.left = this.left || 0;
            this.top = this.top || 0;

            this.initBase();

            this.initChildren();

            this._toSortChildren = true;

            if (this.afterInit) {
                this.afterInit();
            }
        },

        compute: function() {
            this.computeSelf();
            this.layout.compute(this);
            this.updateHolders();
            this.updateAABB();
        },

        checkTouch: function(type, args) {
            if (this.disabled || !this.visible || this.alpha <= 0) {
                return false;
            }
            var rs = this.checkTouchChildren(type, arguments);
            if (rs !== false) {
                return rs;
            }
        },

    });


    exports.Root = Root;


}(CUI));
