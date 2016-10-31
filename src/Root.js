"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Composite = exports.Composite;
    var Component = exports.Component;
    var noop = exports.noop;

    var Root = Class.create({
        id: "cmp_root",

        width: null,
        height: null,

        updateSelf: noop,
        renderSelf: noop,
        checkTouchSelf: noop,

        init: function() {
            this.all = {};

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

            if (this.afterInit) {
                this.afterInit();
            }
        },

        setSize: function(width, height, force) {
            if (force || this.width != width) {
                this.viewportWidth = width;
                this.width = width;
                this.w = width;
                this.pixel.width = width;
                this.aabb[2] = width;
                this.needToCompute = true;
            }
            if (force || this.height != height) {
                this.viewportHeight = height;
                this.height = height;
                this.h = height;
                this.pixel.height = height;
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

    }, Component);


    exports.Root = Root;


}(CUI));
