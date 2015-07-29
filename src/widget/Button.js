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

        autoSizeWithText:false,

        onTouchStart: function(x, y, id) {

            this.state = this.downState;

        },

        onTouchMove: function(x, y, id) {
            if (!this.isInRegion(x, y)) {
                this.state = this.normalState;
                return false;
            }
        },

        onTouchEnd: function(x, y, id) {
            this.state = this.normalState;
        },

        onTap: function(x, y, id) {
            this.state = this.normalState;
        },

    }, Label);


    exports.Button = Button;

    if (typeof module != "undefined") {
        module.exports = Button;
    }

}(CUI));
