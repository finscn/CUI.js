"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Label = exports.Label;

    var Button = Class.create({

        // init: function() {
        //     Button.$super.init.call(this);
        // },

        onTouchStart: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.state = this.downState;

        },

        onTouchMove: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            if (!this.isInRegion(x, y)) {
                this.state = this.normalState;
                return false;
            }
        },

        onTouchEnd: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.state = this.normalState;
        },

        onTap: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.state = this.normalState;
        },

    }, Label);


    exports.Button = Button;

    if (typeof module != "undefined") {
        module.exports = Button;
    }

}(CUI));
