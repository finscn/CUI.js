"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;

    var Blank = Class.create({

        composite: false,
        disabled: false,

        computeLayout: function(forceCompute) {
            this.needToCompute = false;
        },
        render: function(context, timeStep, now) {

        },


    }, Component);


    exports.Blank = Blank;

    if (typeof module != "undefined") {
        module.exports = Blank;
    }

}(CUI));
