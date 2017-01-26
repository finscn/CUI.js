"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Label = exports.Label;

    var Button = Class.create({
        superclass: Label,

        // init: function() {
        //     Button.$super.init.call(this);
        // },

        borderWidth: 0,

        autoSizeWithText: false,

        textAlign: "center",

        doUp: function() {
            this.touchId = null;
            this.pressed = false;
            this.onUp();
        },
        doDown: function() {
            this.pressed = true;
            this.onDown();
        },

        onDown: function() {
            this.offsetY = 2;
            this.scale = 0.92;
        },
        onUp: function() {
            this.offsetY = 0;
            this.scale = 1;
        },

        touchStart: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.touchId = id;
            this.onTouchStart(x, y, id);
            this.doDown();
        },

        pan: function(x, y, dx, dy, sx, sy, id) {
            if (this.disabled) {
                return false;
            }
            if (this.touchId === id && !this.isInRegion(x, y)) {
                this.doUp();
                this.onMoveOut(x, y, dx, dy, sx, sy, id);
            }
            return false;
        },
        onMoveOut: function(x, y, dx, dy, sx, sy, id) {

        },

        touchEnd: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            if (this.touchId === id) {
                this.doUp();
                if (this.isInRegion(x, y)) {
                    return this.onTouchEnd(x, y, id);
                }
            }
            return false;
        },

        swipe: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            if (this.touchId === id) {
                this.doUp();
            }
            return false;
        },

        tap: function(x, y, id) {
            if (this.disabled) {
                return;
            }
            this.beforeTap(x, y, id);
            var rs = this.onTap(x, y, id);
            this.afterTap(x, y, id);
            return rs;
        },
        beforeTap: function(x, y, id) {},
        afterTap: function(x, y, id) {},

        beforeRender: function(context, timeStep, now) {
            if (this.disabled) {
                this._prevAlpha = this.alpha;
                this.alpha = 0.6;
            }
        },
        afterRender: function(context, timeStep, now) {
            if (this.disabled) {
                this.alpha = this._prevAlpha;
            }
        },

    });


    exports.Button = Button;

    if (typeof module != "undefined") {
        module.exports = Button;
    }

}(CUI));
