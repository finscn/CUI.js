"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var TouchTarget = Class.create({
        constructor: TouchTarget,

        modalFlag: -0x100000,

        checkTouch: function(type, args) {
            if (!this.visible || this.alpha <= 0) {
                return false;
            }
            args = Array.prototype.slice.call(arguments, 1);
            if (type != "onSwipe") {
                var x = args[0],
                    y = args[1];
                if (!this.isInRegion(x, y)) {
                    if (this.modal && type == "onTap") {
                        this.onTapMask.apply(this, args);
                        return this.modalFlag;
                    }
                    return false;
                }
            }
            var rs;
            if (this.composite) {
                rs = this.checkTouchChildren(type, arguments);
            }
            if (!rs) {
                return this.checkTouchSelf(type, args);
            }
            return false;
        },

        checkTouchSelf: function(type, args) {
            if (this[type]) {
                var rs = this[type].apply(this, args);
                if (rs) {
                    return rs;
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
                if (!ui.visible || ui.alpha <= 0) {
                    continue;
                }
                // rs = ui[type].apply(ui, args);
                rs = ui.checkTouch.apply(ui, args);
                if (rs) {
                    return rs;
                }
            }
            return false;
        },

        ///////////////////////////////////////////////////////

        onTouchStart: function(x, y, id) {

        },

        onTouchMove: function(x, y, id) {

        },

        onTouchEnd: function(x, y, id) {

        },

        onTap: function(x, y, id) {

        },

        onPan: function(x, y, dx, dy, startX, startY, id) {

        },

        onSwipe: function(x, y, vx, vy, startX, startY, id) {

        },

        onTapMask: function(x, y, id) {

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
