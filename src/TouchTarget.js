"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var TouchTarget = Class.create({
        constructor: TouchTarget,

        modalFlag: -0x100000,

        checkTouchSelf: function(type, args) {
            var action = type + "Action";
            if (this[action]) {
                var rs = this[action].apply(this, args);
                if (rs) {
                    return rs;
                }
            }
            if (this.modal && type == "onTap") {
                this.onTapMask.apply(this, args);
                return this.modalFlag;
            }
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
                rs = ui[type].apply(ui, args);
                if (rs) {
                    return rs;
                }
                if (ui.modal && type == "onTap") {
                    ui.onTapMask.apply(ui, args);
                    return this.modalFlag;
                }
            }
            return false;
        },

        ///////////////////////////////////////////////////////

        onTouchStart: function(x, y, id) {
            if (!this.visible || this.alpha <= 0) {
                return false;
            }
            if (!this.isInRegion(x, y)) {
                return false;
            }
            var rs;
            if (this.composite) {
                rs = this.checkTouchChildren("onTouchStart", arguments);
            }
            if (!rs) {
                this.checkTouchSelf("onTouchStart", arguments);
            }
        },

        onTouchMove: function(x, y, id) {
            if (!this.visible || this.alpha <= 0) {
                return false;
            }
            if (!this.isInRegion(x, y)) {
                return false;
            }
            var rs;
            if (this.composite) {
                rs = this.checkTouchChildren("onTouchMove", arguments);
            }
            if (!rs) {
                this.checkTouchSelf("onTouchMove", arguments);
            }
        },

        onTouchEnd: function(x, y, id) {
            if (!this.visible || this.alpha <= 0) {
                return false;
            }
            if (!this.isInRegion(x, y)) {
                return false;
            }
            var rs;
            if (this.composite) {
                rs = this.checkTouchChildren("onTouchEnd", arguments);
            }
            if (!rs) {
                this.checkTouchSelf("onTouchEnd", arguments);
            }
        },

        onTap: function(x, y, id) {
            if (!this.visible || this.alpha <= 0) {
                return false;
            }
            if (!this.isInRegion(x, y)) {
                return false;
            }
            var rs;
            if (this.composite) {
                rs = this.checkTouchChildren("onTap", arguments);
            }
            if (!rs) {
                this.checkTouchSelf("onTap", arguments);
            }
        },

        onPan: function(x, y, dx, dy, startX, startY, id) {
            if (!this.visible || this.alpha <= 0) {
                return false;
            }
            if (!this.isInRegion(x, y)) {
                return false;
            }
            var rs;
            if (this.composite) {
                rs = this.checkTouchChildren("onPan", arguments);
            }
            if (!rs) {
                this.checkTouchSelf("onPan", arguments);
            }
        },

        onSwipe: function(x, y, vx, vy, startX, startY, id) {
            if (!this.visible || this.alpha <= 0) {
                return false;
            }
            // if (!this.isInRegion(x,y)){
            //     return false;
            // }
            var rs;
            if (this.composite) {
                rs = this.checkTouchChildren("onSwipe", arguments);
            }
            if (!rs) {
                this.checkTouchSelf("onSwipe", arguments);
            }
        },

        onTapMask: function(x, y, id) {

        },

        onTouchStartAction: null,
        onTouchMoveAction: null,
        onTouchEndAction: null,
        onTapAction: null,
        onPanAction: null,
        onSwipeAction: null,

    });

    TouchTarget.apply = function(object, override) {
        var proto = TouchTarget.prototype;
        // override = override !== false;
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
