"use strict";

var CUI = CUI || {};

(function(exports) {

    var ButtonComponent = function() {

    };

    var proto = {

        doUp: function(x, y, id) {
            this.touchId = null;
            this.pressed = false;
            this.onUp(x, y, id);
        },
        doDown: function(x, y, id) {
            this.pressed = true;
            this.onDown(x, y, id);
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
            if (this.touchId === id) {
                if (this.containPoint(x, y)) {
                    this.onPan(x, y, dx, dy, sx, sy, id);
                } else {
                    this.doUp(x, y, id);
                    this.onMoveOut(x, y, dx, dy, sx, sy, id);
                }
            }
            return false;
        },

        touchEnd: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            if (this.touchId === id) {
                this.doUp(x, y, id);
                if (this.containPoint(x, y)) {
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

        onDown: function(x, y, id) {

        },
        onUp: function(x, y, id) {

        },
        onTap: function(x, y, id) {

        },
        onPan: function(x, y, dx, dy, sx, sy, id) {

        },
        onMoveOut: function(x, y, dx, dy, sx, sy, id) {

        },
    };

    ButtonComponent.applyTo = function(object, override) {
        override = override === true;
        for (var p in proto) {
            if (override || !(p in object)) {
                object[p] = proto[p];
            }
        }
    };

    exports.ButtonComponent = ButtonComponent;

    if (typeof module !== "undefined") {
        module.exports = ButtonComponent;
    }

}(CUI));