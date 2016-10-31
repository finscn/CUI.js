"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseRenderer = exports.BaseRenderer;
    var Font = exports.Font;

    var TextRenderer = Class.create({

        text: null,
        color: "black",

        // "start", "end", "left", "right", "center",
        textAlign: "start",
        verticalAlign: "middle",

        // alphabetic  默认。文本基线是普通的字母基线。
        // top 文本基线是 em 方框的顶端。。
        // hanging 文本基线是悬挂基线。
        // middle  文本基线是 em 方框的正中。
        // ideographic 文本基线是表意基线。
        // bottom  文本基线是 em 方框的底端。
        textBaseline: "alphabetic",

        // "butt", "round", "square"
        lineCap: "butt",
        // "miter", "round", "bevel"
        lineJoin: "round",
        // miterLimit = strokeWidth


        strokeColor: null,
        strokeWidth: 1,

        fontStyle: null,
        fontWeight: null,
        fontSize: 14,
        fontName: "Arial",
        lineHeight: null,

        lines: null,
        lineCount: 1,

        shadowColor: null,
        shadowOffsetX: 0,
        shadowOffsetY: 0,

        measure: null,

        useBuffer: false,
        bufferOffsetX: 0,
        bufferOffsetY: 0,
        bufferPadding: 10,
        shareBuffer: true,


        init: function() {
            this.pixel = {
                width: this.width,
                height: this.height,
            };
            this.setTextInfo(this);
            this.setParent(this.parent);
            if (this.useBuffer) {
                if (this.shareBuffer) {
                    this.bufferCanvas = TextRenderer.bufferCanvas;
                } else {
                    this.bufferCanvas = document.createElement('canvas');
                }
                this.bufferCanvas._dynamic = true;
                this.bufferContext = this.bufferCanvas.getContext('2d');
            }
        },

        setTextInfo: function(info) {
            this.alignH = this.textAlign;
            this.alignV = this.verticalAlign;

            this.setText(info.text);
            // this.fontName = Font.getName(info.fontName || this.fontName);
            this.color = info.color || this.color;
            this.fontName = info.fontName || this.fontName;
            this.fontSize = info.fontSize || this.fontSize;
            this.fontWeight = info.fontWeight;
            this.fontStyle = Font.getStyle(this.fontSize, this.fontName, this.fontWeight);
        },
        setFontName: function(fontName) {
            this.fontName = fontName;
            this.fontStyle = Font.getStyle(this.fontSize, this.fontName, this.fontWeight);
        },
        setFontSize: function(fontSize) {
            this.fontSize = fontSize;
            this.fontStyle = Font.getStyle(this.fontSize, this.fontName, this.fontWeight);
        },
        setFontWeight: function(fontWeight) {
            this.fontWeight = fontWeight;
            this.fontStyle = Font.getStyle(this.fontSize, this.fontName, this.fontWeight);
        },

        setText: function(text, needToCompute) {
            if (this._text === text) {
                return;
            }
            this._text = text;
            text = this.text = text === null || text === undefined ? "" : text;
            if (Array.isArray(text)) {
                this.lines = text;
            } else {
                this.lines = String(text).split(/(?:\r\n|\r|\n)/);
            }
            this.lineCount = this.lines.length;
            this.needToCompute = needToCompute !== false;
        },

        computeSize: function(context) {
            if (!this.lines) {
                this.needToCompute = false;
                return;
            }
            context.font = this.fontStyle;
            var measure = context.measureText(this.lines[0]);
            measure.height = Math.ceil(this.fontSize * 1.5);
            this.lineHeight = this.lineHeight || measure.height;
            this.measure = measure;
            this.width = measure.width;
            this.height = this.lineHeight * this.lineCount;
            this.pixel.width = this.width;
            this.pixel.height = this.height;
            this.updatePosition();
            this.needToCompute = false;

            if (this.useBuffer) {
                if (this.textAlign == "center") {
                    this.bufferOffsetX = -Math.ceil(this.width / 2 + this.strokeWidth + this.bufferPadding);
                } else if (this.textAlign == "right" || this.textAlign == "end") {
                    this.bufferOffsetX = -(this.width + this.strokeWidth + this.bufferPadding);
                } else {
                    this.bufferOffsetX = -(this.strokeWidth + this.bufferPadding);
                }
                this.bufferOffsetY = -(this.fontSize + this.strokeWidth + this.bufferPadding);
                this.updateBuffer();
            }
        },

        updateBuffer: function() {
            this.bufferCanvas.width = this.width + (this.strokeWidth + this.bufferPadding) * 2;
            this.bufferCanvas.height = this.height + (this.strokeWidth + this.bufferPadding) * 2;
            this.renderContent(this.bufferContext, -this.bufferOffsetX, -this.bufferOffsetY);
            // this.bufferContext.strokeRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
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
            if (!this.visible || this.text === "" || !this.lines) {
                return false;
            }
            if (this.needToCompute) {
                this.computeSize(context);
            } else {
                if (this.useBuffer && this.shareBuffer) {
                    this.updateBuffer();
                }
            }

            var x = this.x - this.anchorX + this.offsetX;
            var y = this.y - this.anchorY + this.offsetY + this.fontSize;

            if (this.useBuffer) {
                context.drawImage(this.bufferCanvas, x + this.bufferOffsetX, y + this.bufferOffsetY);
                return;
            }
            this.renderContent(context, x, y);

        },

        renderContent: function(context, x, y) {
            // var prevTextAlign = context.textAlign;
            // var prevAlpha = context.globalAlpha;
            context.font = this.fontStyle;
            context.textAlign = this.textAlign;
            context.textBaseline = this.textBaseline;
            // context.globalAlpha = this.alpha;

            if (this.shadowColor) {
                context.fillStyle = this.shadowColor;
                this.renderLines(context, x + this.shadowOffsetX, y + this.shadowOffsetY, true);
            }

            if (this.color) {
                context.fillStyle = this.color;
            }

            if (this.strokeColor) {

                context.lineCap = this.lineCap;
                context.lineJoin = this.lineJoin;

                context.lineWidth = this.strokeWidth;
                context.strokeStyle = this.strokeColor;
            }

            this.renderLines(context, x, y);
            // context.textAlign = prevTextAlign;
            // context.globalAlpha = prevAlpha;
        },

        renderLines: function(context, x, y, shadow) {
            if (this.lineCount > 1) {
                var Me = this;
                var lineHeight = this.lineHeight;
                this.lines.forEach(function(line) {
                    Me.renderText(context, line, x, y, shadow);
                    y += lineHeight;
                });
            } else {
                this.renderText(context, this.lines[0], x, y, shadow);
            }
        },

        renderText: function(context, text, x, y, shadow) {
            if (!text) {
                return;
            }
            if (this.strokeColor && !shadow) {
                context.strokeText(text, x, y);
            }
            context.fillText(text, x, y);
        },

    }, BaseRenderer);

    TextRenderer.bufferCanvas = document.createElement('canvas');
    TextRenderer.bufferCanvas.width = 1;
    TextRenderer.bufferCanvas.height = 1;

    exports.TextRenderer = TextRenderer;

    if (typeof module != "undefined") {
        module.exports = TextRenderer;
    }

}(CUI));
