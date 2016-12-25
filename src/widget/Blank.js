"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;

    var Blank = Class.create({
        superclass: Component,

        composite: false,
        disabled: false,
        backgroundColor: null,
        computeLayout: function(forceCompute) {
            this.needToCompute = false;
        },
        render: function(renderer, timeStep, now) {
            if (this.backgroundColor !== null) {
                renderer.setAlpha(this.backgroundAlpha);
                renderer.fillRect(this.x, this.y, this.w, this.h, this.backgroundColor, this.pixel);
                renderer.restoreAlpha();
            }
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

    if (typeof module != "undefined") {
        module.exports = Blank;
    }

}(CUI));
