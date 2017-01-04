"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var BaseHolder = exports.BaseHolder;
    var Font = exports.Font;

    var TextHolder = Class.create({
        superclass: BaseHolder,

        text: null,
        color: "#000000",

        // "start", "end", "left", "right", "center",
        textAlign: "start",
        verticalAlign: "middle",

        // top 默认。文本基线是 em 方框的顶端。。
        // alphabetic  文本基线是普通的字母基线。
        // hanging 文本基线是悬挂基线。
        // middle  文本基线是 em 方框的正中。
        // ideographic 文本基线是表意基线。
        // bottom  文本基线是 em 方框的底端。
        textBaseline: "top",

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

        useCache: false,
        cacheOffsetX: 0,
        cacheOffsetY: 0,
        cachePadding: 4,
        shareCache: false,
        useCachePool: true,

        init: function() {
            this.pixel = {
                width: this.width,
                height: this.height,
            };

            this.setTextInfo(this);
            this.setParent(this.parent);

            this.id = this.id || "text-holder-" + this.parent.id;

            this.initTextObject();

            this.computeSize();
        },

        createCache: function() {
            if (!this.cacheCanvas) {
                if (this.shareCache) {
                    this.cacheCanvas = TextHolder.cacheCanvas;
                } else if (this.useCachePool) {
                    this.cacheCanvas = Component.getCanvasFromPool(this.id);
                } else {
                    this.cacheCanvas = document.createElement("canvas");
                }
            }
            this.cacheContext = this.cacheCanvas.getContext('2d');
            this.cacheContext.textBaseline = "top";
        },

        initTextObject: function() {
            if (!CUI.renderer) {
                // TODO
            } else {
                // TODO
            }

            if (CUI.renderer.webgl) {
                this.useCache = true;
                this.shareCache = false;
            }

            if (this.useCache) {
                // TODO
                this.createCache();
                this.textObject = CUI.renderer.createTextObject(this.cacheContext, true);
            }
        },

        setTextInfo: function(info) {
            this.alignH = this.textAlign;
            this.alignV = this.verticalAlign;

            this.setText(info.text, true);
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
            this.textChanged = true;
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

        computeSize: function() {
            if (!this.lines) {
                this.needToCompute = false;
                return;
            }
            var ctx = textContext;
            ctx.font = this.fontStyle;
            var measure = ctx.measureText(this.lines[0]);
            measure.height = Math.ceil(this.fontSize * 1.5);
            this.lineHeight = this.lineHeight || measure.height;
            this.measure = measure;
            this.width = measure.width;
            this.height = this.lineHeight * this.lineCount;
            this.pixel.width = this.width;
            this.pixel.height = this.height;
            this.updatePosition();
            this.needToCompute = false;

            if (this.useCache) {
                if (this.textAlign == "center") {
                    this.cacheOffsetX = -Math.ceil(this.width / 2 + this.strokeWidth + this.cachePadding);
                } else if (this.textAlign == "right" || this.textAlign == "end") {
                    this.cacheOffsetX = -(this.width + this.strokeWidth + this.cachePadding);
                } else {
                    this.cacheOffsetX = -(this.strokeWidth + this.cachePadding);
                }
                this.cacheOffsetY = -(this.strokeWidth + this.cachePadding);
                this.updateCache();
                this.textObject.updateSize();
            }
        },

        updateCache: function() {
            this.cacheCanvas.width = this.width + (this.strokeWidth + this.cachePadding) * 2;
            this.cacheCanvas.height = this.height + (this.strokeWidth + this.cachePadding) * 2;
            this.renderContent(this.cacheContext, -this.cacheOffsetX, -this.cacheOffsetY);
            // this.cacheContext.strokeRect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
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

        render: function(renderer, timeStep, now) {
            if (!this.visible || this.text === "" || !this.lines) {
                return false;
            }
            if (this.needToCompute) {
                this.computeSize();
            } else {
                if (this.textChanged || this.shareCache) {
                    if (this.useCache) {
                        this.updateCache();
                        this.textObject.updateContent();
                    }
                }
            }

            var x = this.x - this.anchorX + this.offsetX;
            var y = this.y - this.anchorY + this.offsetY;

            if (this.useCache) {
                x += this.cacheOffsetX;
                y += this.cacheOffsetY;
            }
            renderer.renderAt(this.textObject, x, y);
        },

        renderContent: function(context, x, y) {
            // var prevTextAlign = context.textAlign;
            // var prevAlpha = context.globalAlpha;
            // context.globalAlpha = this.alpha;
            context.font = this.fontStyle;
            context.textAlign = this.textAlign;
            context.textBaseline = this.textBaseline;

            if (this.shadowColor !== null) {
                context.fillStyle = this.shadowColor;
                this.renderLines(context, x + this.shadowOffsetX, y + this.shadowOffsetY, true);
            }

            if (this.color !== null) {
                context.fillStyle = this.color;
            }

            if (this.strokeColor !== null) {

                context.lineCap = this.lineCap;
                context.lineJoin = this.lineJoin;

                context.lineWidth = this.strokeWidth;
                context.strokeStyle = this.strokeColor;
            }

            this.renderLines(context, x, y);
            this.textChanged = false;
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

    });

    var textCanvas = document.createElement("canvas");
    var textContext = textCanvas.getContext("2d");

    TextHolder.cacheCanvas = document.createElement('canvas');
    TextHolder.cacheCanvas.width = 3;
    TextHolder.cacheCanvas.height = 3;

    exports.TextHolder = TextHolder;

    if (typeof module != "undefined") {
        module.exports = TextHolder;
    }

}(CUI));
