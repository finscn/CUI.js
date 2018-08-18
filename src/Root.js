"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Composite = exports.Composite;
    var Component = exports.Component;
    var noop = exports.noop;

    var Root = Class.create({
        superclass: Component,

        initialize: function() {
            this.width = null;
            this.height = null;

            this.left = null;
            this.top = null;
            this.originalX = 0;
            this.originalY = 0;

            this.resetSN = 1;
        },

        updateSelf: noop,
        checkTouchSelf: noop,

        init: function() {
            if (this.resetSN || this.resetSN === 0) {
                Component._SN = Number(this.resetSN) || 1;
            }

            this.id = this.id || "root_" + Component._SN++;

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

            this.relative = "root";
            this.root = this;
            this.aabb = [0, 0, 0, 0];

            Root.$super.init.call(this);

            if (this.afterInit) {
                this.afterInit();
            }
        },

        computeSelf: function(parent) {
            // console.log('Component.computeSelf', this.id);
            parent = parent || {};
            this.pixel.realOuterWidth = this.width;
            this.pixel.realOuterHeight = this.height;
            this.setSize(this.width, this.height, true);

            this.computePositionX();
            this.computePositionY();
            this.computePadding();

            this.updateAABB();
        },

        setSize: function(width, height, force) {
            if (force || this.width !== width) {
                this.viewportWidth = width;
                this.width = width;
                this.pixel.width = width;
                this.absoluteWidth = width;
                this.aabb[2] = width;
                this._needToCompute = true;
            }
            if (force || this.height !== height) {
                this.viewportHeight = height;
                this.height = height;
                this.pixel.height = height;
                this.absoluteHeight = height;
                this.aabb[3] = height;
                this._needToCompute = true;
            }
            console.log(this.pixel)
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
