"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var TouchTarget = Class.create({

        modalFlag: -0x100000,

        // return: boolean, component,  string(id)
        checkTouch: function(type, args) {
            if (!this.visible || this.alpha <= 0 || this.disabled) {
                return false;
            }
            var argsList = Array.prototype.slice.call(arguments, 1);
            // if (type !== "swipe") {
            //     var x = argsList[0],
            //         y = argsList[1];
            //     if (!this.containPoint(x, y)) {
            //         if (this.modal) {
            //             if (type === "tap") {
            //                 this.onTapOut.apply(this, argsList);
            //             }
            //             return this.modalFlag;
            //         }
            //         return false;
            //     }
            // }

            var x = argsList[0],
                y = argsList[1];
            if (!this.containPoint(x, y)) {
                if (this.modal || this.mask) {
                    if (type === "tap") {
                        this.onTapOut.apply(this, argsList);
                    } else if (type === "touchEnd") {
                        if (this.composite) {
                            this.checkTouchChildren(type, arguments);
                        } else {
                            this[type].apply(this, argsList);
                        }
                    }
                    return this.modalFlag;
                }
                // if (type === "tap" || type === "touchStart" || type === "touchEnd") {
                if (type === "tap" || type === "touchStart") {
                    return false;
                }
            }

            if (this.composite) {
                var rs = this.checkTouchChildren(type, arguments);
                if (rs !== false) {
                    return rs;
                }
            }

            var rs = this.checkTouchSelf(type, argsList);
            if (rs === false && (this.modal || this.mask)) {
                return this.modalFlag;
            }

            if (type === "touchEnd" ||　this.hollow) {
                return rs;
            }

            // return rs;
            return this.id || true;
        },

        checkTouchSelf: function(type, args) {
            if (this.visible && this[type]) {
                var rs = this[type].apply(this, args);
                if (rs !== false) {
                    return this;
                }
            }
            return false;
        },

        getTouchableChildren: function() {
            return this.children;
        },
        checkTouchChildren: function(type, args) {
            var list = this.getTouchableChildren();
            if (list) {
                for (var i = list.length - 1; i >= 0; i--) {
                    var ui = list[i];
                    if (!ui.visible || ui.alpha <= 0) {
                        continue;
                    }
                    // rs = ui[type].apply(ui, args);
                    var rs = ui.checkTouch.apply(ui, args);
                    if (rs !== false) {
                        // return ui;
                        return rs;
                    }
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

        ///////////////////////////////////////////////////////

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
        // Return `true` to block event
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

    TouchTarget.applyTo = function(object, override) {
        var proto = TouchTarget.prototype;
        for (var p in proto) {
            var v = proto[p];
            if (typeof v === "function" || p === "modalFlag") {
                (override || !object[p]) && (object[p] = v);
            }
        }
        return object;
    };

    exports.TouchTarget = TouchTarget;

    if (typeof module !== "undefined") {
        module.exports = TouchTarget;
    }

}(CUI));
