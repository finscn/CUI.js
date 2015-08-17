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

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.viewportWidth = this.width;
            this.viewportHeight = this.height;
            this.left = 0;
            this.top = 0;
            this.relative = "root";


            Root.$super.init.call(this);

            this.x = 0;
            this.y = 0;
            this.w = this.width;
            this.h = this.height;

            this.pixel = {
                width: this.width,
                height: this.height,
                paddingLeft: 0,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
            };
            this.aabb = [
                0, 0, this.width, this.height
            ];
            this.root = this;
            if (this.afterInit) {
                this.afterInit();
            }
        },

        checkTouch: function(type, args) {
            var rs = this.checkTouchChildren(type, arguments);
            if (rs !== false) {
                return 1;
            }
        },

    }, Component);


    exports.Root = Root;


}(CUI));
