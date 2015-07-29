"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;


    var Panel = Class.create({
        superclass: Component,

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            Panel.$super.init.call(this);

            if (this.afterInit) {
                this.afterInit();
            }
        }
    });

    exports.Panel = Panel;

    if (typeof module != "undefined") {
        module.exports = Panel;
    }

}(CUI));
