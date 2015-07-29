"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;


    var Page = Class.create({
        superclass: Component,

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            Page.$super.init.call(this);

            if (this.afterInit) {
                this.afterInit();
            }
        }
    });

    exports.Page = Page;

    if (typeof module != "undefined") {
        module.exports = Page;
    }

}(CUI));
