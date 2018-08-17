"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;

    var Blank = Class.create({
        superclass: Component,

        initialize: function() {
            this.composite = false;
            this.disabled = false;
            this.backgroundColor = null;
        },

        computeLayout: function(forceCompute) {
            this._needToCompute = false;
        },
    });

    Blank.create = function(width, height, parent) {
        var comp = new CUI.Blank({
            parent: parent,
            width: width,
            height: height,
        });
        return comp;
    };

    exports.Blank = Blank;

    if (typeof module !== "undefined") {
        module.exports = Blank;
    }

}(CUI));
