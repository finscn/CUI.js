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

        autoSizeWithText: false,

        textAlign: "center",

        onTouchStart: function(x, y, id) {
            this.scale = 0.92;
            // this.state = this.downState;
        },

        onTouchMove: function(x, y, id) {
            if (!this.isInRegion(x, y)) {
                this.scale = 1;
                // this.state = this.normalState;
                return false;
            }
        },

        onTouchEnd: function(x, y, id) {
            this.scale = 1;
            // this.state = this.normalState;
        },

        onTap: function(x, y, id) {
            // this.state = this.normalState;
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
