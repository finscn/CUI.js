"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var TouchTarget = Class.create({
        constructor: TouchTarget,

        modalFlag: -0x100000,

        checkTouch: function(type, args) {
            if (this.disabled || !this.visible || this.alpha <= 0) {
                return false;
            }
            args = Array.prototype.slice.call(arguments, 1);

            // if (type != "swipe") {
            //     var x = args[0],
            //         y = args[1];
            //     if (!this.isInRegion(x, y)) {
            //         if (this.modal) {
            //             if (type == "tap") {
            //                 this.onTapOut.apply(this, args);
            //             }
            //             return this.modalFlag;
            //         }
            //         return false;
            //     }
            // }
            var x = args[0],
                y = args[1];
            if (!this.isInRegion(x, y)) {
                if (this.modal || this.mask) {
                    if (type == "tap") {
                        this.onTapOut.apply(this, args);
                    }
                    return this.modalFlag;
                }
                if (type == "tap" || type == "touchStart" || type == "touchEnd") {
                    return false;
                }
            }

            if (this.composite) {
                var rs = this.checkTouchChildren(type, arguments);
                if (rs !== false) {
                    return 1;
                }
            }
            return this.checkTouchSelf(type, args);
        },

        checkTouchSelf: function(type, args) {
            if (this[type]) {
                var rs = this[type].apply(this, args);
                if (rs !== false) {
                    return 1;
                }
            }
            return false;
        },

        checkTouchChildren: function(type, args) {
            var list = this.children;
            var last = list.length - 1;
            var rs = false;
            for (var i = last; i >= 0; i--) {
                var ui = list[i];
                if (ui.disabled || !ui.visible || ui.alpha <= 0) {
                    continue;
                }
                // rs = ui[type].apply(ui, args);
                rs = ui.checkTouch.apply(ui, args);
                if (rs !== false) {
                    return 1;
                }
            }
            return false;
        },

        ///////////////////////////////////////////////////////


        touchStart: function(x, y, id) {
            return this.onTouchStart(x, y, id);
        },
        touchEnd: function(x, y, id) {
            return this.onTouchEnd(x, y, id);
        },
        touchMove: function(x, y, id) {
            return this.onTouchMove(x, y, id);
        },
        tap: function(x, y, id) {
            return this.onTap(x, y, id);
        },
        pan: function(x, y, dx, dy, startX, startY, id) {
            return this.onPan(x, y, dx, dy, startX, startY, id);
        },
        swipe: function(x, y, vx, vy, startX, startY, id) {
            return this.onSwipe(x, y, vx, vy, startX, startY, id);
        },
        tapOut: function(x, y, id) {
            return this.onTapOut(x, y, id);
        },

        ///////////////////////////////////////////////////////

        onTouchStart: function(x, y, id) {
            return false;
        },

        onTouchMove: function(x, y, id) {
            return false;
        },

        onTouchEnd: function(x, y, id) {
            return false;
        },

        onTap: function(x, y, id) {
            return false;
        },

        onPan: function(x, y, dx, dy, startX, startY, id) {
            return false;
        },

        onSwipe: function(x, y, vx, vy, startX, startY, id) {
            return false;
        },

        onTapOut: function(x, y, id) {
            return false;
        },

    });

    TouchTarget.apply = function(object, override) {
        var proto = TouchTarget.prototype;
        for (var p in proto) {
            var v = proto[p];
            if (typeof v == "function") {
                (override || !object[p]) && (object[p] = v);
            }
        }
        return object;
    };

    exports.TouchTarget = TouchTarget;

    if (typeof module != "undefined") {
        module.exports = TouchTarget;
    }

}(CUI));
