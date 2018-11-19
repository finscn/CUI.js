"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var TouchTarget = Class.create({

        modalFlag: -0x10000,
        catchFlag: -0x10001,

        // return: boolean, component,  string(id)
        checkTouch: function(type /* , args... */ ) {
            if (!this.visible || this.alpha <= 0) {
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
                if (this.modal) {
                    if (type === "tap") {
                        this.onTapOut.apply(this, argsList);
                    } else if (type === "touchEnd") {
                        if (this.composite) {
                            this.checkTouchChildren(arguments);
                        }
                        this[type].apply(this, argsList);
                    }
                    return this.modalFlag;
                }
                // if (type === "tap" || type === "touchStart" || type === "touchEnd") {
                if (type === "tap" || type === "touchStart") {
                    return false;
                }
            }

            if (this.composite) {
                var rs = this.checkTouchChildren(arguments);
                if (rs !== false) {
                    return rs;
                }
            }

            var rs = false;
            if (this[type]) {
                rs = this[type].apply(this, argsList);
                if (rs !== false) {
                    rs = this;
                }
            }

            if (rs === false) {
                if (this.modal) {
                    return this.modalFlag;
                }

                if (type === "tap" || type === "touchStart") {
                    return this.catchFlag;
                }
            }

            return rs;
        },

        checkTouchChildren: function(args) {
            if (this.disabled) {
                return false;
            }
            var list = this.getTouchableChildren();
            if (list) {
                for (var i = list.length - 1; i >= 0; i--) {
                    var ui = list[i];
                    if (!ui.visible || ui.alpha <= 0) {
                        continue;
                    }
                    var rs = ui.checkTouch.apply(ui, args);
                    if (!ui.hollow && rs !== false) {
                        // return ui;
                        return rs;
                    }
                }
            }
            return false;
        },

        ///////////////////////////////////////////////////////

        getTouchableChildren: function() {
            return this.children;
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
