"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Label = exports.Label;

    var Button = Class.create({
        superclass: Label,

        initialize: function() {
            this.borderWidth = 0;
            this.textAlign = "center";
        },

        // init: function() {
        //     Button.$super.init.call(this);
        // },

        doUp: function(x, y, id) {
            this.touchId = null;
            this.pressed = false;
            this.onUp(x, y, id);
        },
        doDown: function(x, y, id) {
            this.pressed = true;
            this.onDown(x, y, id);
        },

        onDown: function(x, y, id) {
            this.offsetY = 2;
            this.scale = 0.92;
        },
        onUp: function(x, y, id) {
            this.offsetY = 0;
            this.scale = 1;
        },

        touchStart: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.touchId = id;
            this.onTouchStart(x, y, id);
            this.doDown(x, y, id);
        },

        pan: function(x, y, dx, dy, sx, sy, id) {
            if (this.disabled) {
                return false;
            }
            if (this.touchId === id && !this.isInRegion(x, y)) {
                this.doUp(x, y, id);
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
                this.doUp(x, y, id);
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
                this.doUp(x, y, id);
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
