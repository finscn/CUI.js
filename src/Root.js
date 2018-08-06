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
            this.id = "cmp_root";

            this.width = null;
            this.height = null;

            this.left = null;
            this.top = null;
            this.originalX = 0;
            this.originalY = 0;

            this.resetSN = 1;
        },

        updateSelf: noop,
        renderSelf: noop,
        checkTouchSelf: noop,

        init: function() {
            this.all = {};

            if (this.resetSN || this.resetSN === 0) {
                Component._SN = Number(this.resetSN) || 1;
            }

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

            Root.$super.init.call(this);

            this.pixel = {
                paddingLeft: 0,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,

                marginLeft: 0,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,

                realMarginLeft: 0,
                realMarginTop: 0,
                realMarginRight: 0,
                realMarginBottom: 0,

                realOuterWidth: this.width,
                realOuterHeight: this.height,
            };

            this.aabb = [
                0, 0
            ];
            this.setSize(this.width, this.height, true);
            this.computePositionX();
            this.computePositionY();

            this.root = this;

            this.initChildren();

            if (this.afterInit) {
                this.afterInit();
            }
        },

        setSize: function(width, height, force) {
            if (force || this.width !== width) {
                this.viewportWidth = width;
                this.width = width;
                this.pixel.width = width;
                this.w = width;
                this.aabb[2] = width;
                this.needToCompute = true;
            }
            if (force || this.height !== height) {
                this.viewportHeight = height;
                this.height = height;
                this.pixel.height = height;
                this.h = height;
                this.aabb[3] = height;
                this.needToCompute = true;
            }
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
