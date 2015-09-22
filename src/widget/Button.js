"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Label = exports.Label;

    var Button = Class.create({

        // init: function() {
        //     Button.$super.init.call(this);
        // },

        borderWidth: 2,

        autoSizeWithText: false,

        textAlign: "center",

        touchStart: function(x, y, id) {
            this.touchId = id;
            this.scale = 0.92;
        },

        pan: function(x, y, dx, dy, sx, sy, id) {
            if (this.touchId === id && !this.isInRegion(x, y)) {
                this.touchId = null;
                this.scale = 1;
                this.onMoveOut(x, y, dx, dy, sx, sy, id);
            }
            return false;
        },
        onMoveOut: function(x, y, dx, dy, sx, sy, id) {

        },

        touchEnd: function(x, y, id) {
            if (this.touchId === id) {
                this.touchId = null;
                this.scale = 1;
                if (this.isInRegion(x, y)) {
                    return this.onTouchEnd(x, y, id);
                }
            }
            return false;
        },

        swipe: function(x, y, id) {
            if (this.touchId === id) {
                this.touchId = null;
                this.scale = 1;
            }
            return false;
        },

        tap: function(x, y, id) {
            return this.onTap(x, y, id);
        },

        beforeRender: function(context, timeStep, now) {
            context.globalAlpha = (this.disabled ? 0.5 : 1) * this.alpha;
        },
        afterRender: function(context, timeStep, now) {
            context.globalAlpha = this.alpha;
        },


    }, Label);


    exports.Button = Button;

    if (typeof module != "undefined") {
        module.exports = Button;
    }

}(CUI));
