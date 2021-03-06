"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Label = exports.Label;
    var ButtonComponent = exports.ButtonComponent;

    var Button = Class.create({
        superclass: Label,

        initialize: function() {
            this.borderWidth = 0;
            this.textAlign = "center";

            this.scaleBg = true;
        },

        // init: function() {
        //     Button.$super.init.call(this);
        // },

        onDown: function(x, y, id) {
            this.offsetY = 2;
            this.scale = 0.92;
        },
        onUp: function(x, y, id) {
            this.offsetY = 0;
            this.scale = 1;
        },

        setDisabled: function(disabled) {
            this.disabled = disabled;
            if (disabled) {
                this.alpha = 0.6;
            } else {
                this.alpha = this._defaultAlpha;
            }
        },
    });

    ButtonComponent.applyTo(Button.prototype);

    exports.Button = Button;

    if (typeof module !== "undefined") {
        module.exports = Button;
    }

}(CUI));
