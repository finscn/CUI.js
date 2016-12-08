"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;

    var Blank = Class.create({

        composite: false,
        disabled: false,
        backgroundColor: null,
        computeLayout: function(forceCompute) {
            this.needToCompute = false;
        },
        render: function(context, timeStep, now) {
            if (this.backgroundColor !== null) {
                context.fillStyle = this.backgroundColor;
                context.fillRect(this.x, this.y, this.w, this.h);
            }
        },

    }, Component);

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
