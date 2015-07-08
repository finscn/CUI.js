"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Font = exports.Font;

    var TextRenderer = Class.create({

        DEG_TO_RAD: Math.PI / 180,
        RAD_TO_DEG: 180 / Math.PI,
        HALF_PI: Math.PI / 2,
        DOUBLE_PI: Math.PI * 2,

        text: null,
        color: null,
        fontName: null,
        fontSize: null,
        fontWeight: null,
        fontStyleText: null,
        lineHeight: null,

        measure: null,

        strokeWidth: 0,

        x: 0,
        y: 0,
        width: 0,
        height: 0,

        initFont: function() {
            this.fontName = Font.getName(this.fontName || "Arial");
            this.fontSize = this.fontSize || 12;
            this.fontColor = this.color;
            this.fontWeight = this.fontWeight || "bold";
            this.fontStyleText = Font.getStyle(this.fontSize, this.fontName, this.fontWeight);
        },

        computeSize: function(context) {
            context.font = this.fontStyleText;
            var measure = context.measureText(this.text);
            measure.height = this.lineHeight || this.fontSize;
            this.measure = measure;
            this.width = measure.width;
            this.height = measure.height;
        },

        alignH: function(align, parent) {

        },
        alignV: function(align, parent) {

        },

        render: function(context, timeStep, now) {
            context.font = this.fontStyleText;
            var x = this.x;
            var y = this.y;
            if (this.strokeWidth) {
                context.lineCap = "round";
                context.lineWidth = this.strokeWidth;
                context.strokeStyle = this.strokeColor;
                context.strokeText(this.text, x, y);
            }
            if (this.fontColor) {
                context.fillStyle = this.fontColor;
            }
            context.fillText(this.text, x, y);
        },

    });


    exports.TextRenderer = TextRenderer;

    if (typeof module != "undefined") {
        module.exports = TextRenderer;
    }

}(CUI));
