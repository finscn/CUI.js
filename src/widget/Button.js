"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Label = exports.Label;
    var ButtonComponent = exports.ButtonComponent;

    var Button = Class.create({
        superclass: Label,

        initialize: function() {
            this.borderWidth = 0;
            this.textAlign = "center";

            this.scaleBg = true;
        },

        init: function() {
            this.id = this.id || "button_" + Core._SN++;

            Button.$super.init.call(this);
        },

        onDown: function(x, y, id) {
            this._normalOffsetY = this.offsetY;
            this._normalScale = this.scale;

            this.offsetY = this.offsetY + 2;
            this.scale = this.scale * 0.92;
        },
        onUp: function(x, y, id) {
            this.offsetY = this._normalOffsetY || 0;
            this.scale = this._normalScale || 1;
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
