"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseRenderer = exports.BaseRenderer;
    var Font = exports.Font;

    var TextRenderer = Class.create({

        text: null,
        color: null,
        fontName: null,
        fontSize: null,
        fontWeight: null,
        fontStyleText: null,
        lineHeight: null,

        measure: null,

        strokeWidth: 0,

        init: function() {
            this.setTextInfo(this);
            this.setParent(this.parent);
        },

        setTextInfo: function(info) {
            this.text = info.text || "";
            this.fontName = Font.getName(info.fontName || "Arial");
            this.fontSize = info.fontSize || 12;
            this.color = info.color;
            this.fontWeight = info.fontWeight;
            this.fontStyleText = Font.getStyle(this.fontSize, this.fontName, this.fontWeight);
            this.needToCompute = true;
        },

        computeSize: function(context) {
            context.font = this.fontStyleText;
            var measure = context.measureText(this.text);
            measure.height = this.lineHeight || this.fontSize * 3 / 2;
            this.measure = measure;
            this.width = measure.width;
            this.height = measure.height;
            this.updatePosition();
            this.needToCompute = false;
        },

        render: function(context, timeStep, now) {
            if (this.needToCompute) {
                this.computeSize(context);
            }

            var alpha = this.alpha + this.offsetAlpha;
            if (alpha <= 0) {
                return false;
            }
            // debugger;
            var x = this.x - this.anchorX + this.offsetX;
            var y = this.y - this.anchorY + this.offsetY + this.fontSize;

            context.font = this.fontStyleText;
            if (this.strokeWidth) {
                context.lineCap = "round";
                context.lineWidth = this.strokeWidth;
                context.strokeStyle = this.strokeColor;
                context.strokeText(this.text, x, y);
            }
            if (this.color) {
                context.fillStyle = this.color;
            }
            context.fillText(this.text, x, y);
        },

    }, BaseRenderer);


    exports.TextRenderer = TextRenderer;

    if (typeof module != "undefined") {
        module.exports = TextRenderer;
    }

}(CUI));
