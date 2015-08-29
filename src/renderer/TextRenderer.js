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

        textAlign: "left",
        verticalAlign: "middle",

        strokeWidth: 0,

        fontStyle: null,
        fontWeight: null,
        fontSize: null,
        fontName: null,
        lineHeight: null,

        fontStyleText: null,
        measure: null,

        init: function() {
            this.setTextInfo(this);
            this.setParent(this.parent);
        },

        setTextInfo: function(info) {
            this.alignH = this.textAlign;
            this.alignV = this.verticalAlign;

            this.setText(info.text);
            this.fontName = Font.getName(info.fontName || "Arial");
            this.fontSize = info.fontSize || 14;
            this.color = info.color || "black";
            this.fontWeight = info.fontWeight;
            this.fontStyleText = Font.getStyle(this.fontSize, this.fontName, this.fontWeight);

        },

        setText: function(text) {
            this.text = text === null || text === undefined ? "" : text;
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

        updatePosition: function() {
            var parent = this.parent;
            if (this.alignH == "center") {
                this.x = parent.x + (parent.w >> 1);
            } else if (this.alignH == "right") {
                this.x = parent.x + parent.w - parent.pixel.paddingRight;
            } else {
                this.x = parent.x + parent.pixel.paddingLeft;
            }

            if (this.alignV == "middle" || this.alignV == "center") {
                this.y = parent.y + ((parent.h - this.height) >> 1);
            } else if (this.alignV == "bottom") {
                this.y = parent.y + parent.h - parent.pixel.paddingBottom - this.height;
            } else {
                this.y = parent.y + parent.pixel.paddingTop;
            }
        },

        render: function(context, timeStep, now) {
            if (this.needToCompute) {
                this.computeSize(context);
            }

            var alpha = this.alpha + this.offsetAlpha;
            if (alpha <= 0) {
                return false;
            }

            var x = this.x - this.anchorX + this.offsetX;
            var y = this.y - this.anchorY + this.offsetY + this.fontSize;

            context.font = this.fontStyleText;
            context.textAlign = this.textAlign;
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
