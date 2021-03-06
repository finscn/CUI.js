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

        initialize: function() {
            this.text = null;
            this.color = "#000000";

            // "start", "end", "left", "right", "center",
            this.textAlign = "start";
            this.verticalAlign = "middle";

            this.alignH = null;
            this.alignV = null;

            // top 默认。文本基线是 em 方框的顶端。。
            // alphabetic  文本基线是普通的字母基线。
            // hanging 文本基线是悬挂基线。
            // middle  文本基线是 em 方框的正中。
            // ideographic 文本基线是表意基线。
            // bottom  文本基线是 em 方框的底端。
            this.textBaseline = "top";

            // "butt", "round", "square"
            this.lineCap = "butt";
            // "miter", "round", "bevel"
            this.lineJoin = "round";
            // miterLimit = strokeWidth

            this.strokeColor = null;
            this.strokeWidth = 1;

            this.fontStyle = null;
            this.fontWeight = null;
            this.fontSize = 14;
            this.fontName = "Arial";
            this.lineHeight = null;

            this.lines = null;
            this.lineCount = 1;

            this.shadowColor = null;
            this.shadowBlur = 0;
            this.shadowOffsetX = 0;
            this.shadowOffsetY = 0;

            this.measure = null;

            this.useCache = false;
            this.cacheOffsetX = 0;
            this.cacheOffsetY = 0;
            this.cachePadding = 4;
            this.shareCache = false;
            this.useCachePool = true;

            this.resizeWithText = true;
            this.lineHeight = 0;
            this.width = 8;
            this.height = 8;
        },

        init: function() {
            this.pixel = {
                relativeX: 0,
                relativeY: 0,

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
            // this.cacheContext.textBaseline = "top";
        },

        initTextObject: function() {
            // var renderer = CUI.renderer;
            var renderer = this.parent.getRenderer();

            if (renderer) {
                // TODO
                if (renderer.webgl) {
                    this.useCache = true;
                    this.shareCache = false;
                } else if (renderer.canvas2d) {
                    this.useCache = true;
                    // this.shareCache = true;
                    this.shareCache = false;
                }
                if (this.useCache) {
                    // TODO
                    this.createCache();
                    this.textObject = renderer.createTextObject(this.cacheContext, true);
                }
            }
        },

        setTextInfo: function(info) {
            if (info.alignH) {
                this.alignH = info.alignH;
            } else {
                this.alignH = info.textAlign || this.textAlign;
            }
            if (info.alignV) {
                this.alignV = info.alignV;
            } else {
                this.alignV = info.verticalAlign || this.verticalAlign;
            }

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

        setColor: function(color) {
            if (this.color === color) {
                return;
            }
            this.color = color;
            this._needToCompute = true;
        },

        setShadowOffset: function(x, y) {
            if (this.shadowOffsetX === x && this.shadowOffsetY === y) {
                return;
            }
            this.shadowOffsetX = x;
            this.shadowOffsetY = y;
            this._needToCompute = true;
        },

        setText: function(text) {
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
            this._needToCompute = true;
        },

        computeSize: function(force) {
            if (!this.lines) {
                this._needToCompute = false;
                return;
            }

            if (force || this.resizeWithText) {
                var ctx = textContext;
                ctx.font = this.fontStyle;
                var measure = ctx.measureText(this.lines[0]);
                measure.height = Math.ceil(this.fontSize * 1.5);
                this.lineHeight = this.lineHeight || measure.height;
                // measure.height = this.lineHeight;
                this.measure = measure;
                this.width = measure.width;
            } else {
                this.lineHeight = this.lineHeight || this.height;
                this.measure = {
                    width: this.width,
                    height: this.lineHeight,
                }
            }

            this.height = this.lineHeight * this.lineCount;

            this.pixel.width = this.width;
            this.pixel.height = this.height;
            this.updatePosition();
            this._needToCompute = false;

            if (this.useCache) {
                if (this.alignH === "center") {
                    this.cacheOffsetX = Math.ceil(this.width / 2 + this.strokeWidth + this.cachePadding);
                } else if (this.alignH === "right" || this.alignH === "end") {
                    this.cacheOffsetX = this.width + this.strokeWidth + this.cachePadding;
                } else {
                    this.cacheOffsetX = this.strokeWidth + this.cachePadding;
                }
                this.cacheOffsetY = this.strokeWidth + this.cachePadding;
                this.updateCache();
                this.textObject.updateSize();
            }
        },

        updateCache: function() {
            this.cacheCanvas.width = this.width + (this.strokeWidth + this.cachePadding) * 2;
            this.cacheCanvas.height = this.height + (this.strokeWidth + this.cachePadding) * 2;
            this.renderContent(this.cacheContext, this.cacheOffsetX, this.cacheOffsetY);
            // this.cacheContext.lineWidth = 4;
            // this.cacheContext.strokeRect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
        },

        updatePosition: function() {
            var parent = this.parent;
            if (this.alignH === "center") {
                this.x = parent.x + (parent.w >> 1);
            } else if (this.alignH === "right") {
                this.x = parent.x + parent.w - parent.pixel.paddingRight;
            } else {
                this.x = parent.x + parent.pixel.paddingLeft;
            }
            this.x += this.offsetX;

            if (this.alignV === "middle" || this.alignV === "center") {
                this.y = parent.y + ((parent.h - this.height) >> 1);
            } else if (this.alignV === "bottom") {
                this.y = parent.y + parent.h - parent.pixel.paddingBottom - this.height;
            } else {
                this.y = parent.y + parent.pixel.paddingTop;
            }
            this.y += this.offsetY;
        },

        render: function(renderer, timeStep, now) {
            if (!this.visible || this.text === "" || !this.lines) {
                return false;
            }
            // if (this._needToCompute) {
            //     this.computeSize();
            // } else {
            if (this._needToCompute || this.shareCache) {
                if (this.useCache) {
                    this.updateCache();
                    this.textObject.updateContent();
                }
            }
            // }

            var x = this.x - this.anchorX;
            var y = this.y - this.anchorY;

            if (this.useCache) {
                renderer.renderAt(this.textObject, x - this.cacheOffsetX, y - this.cacheOffsetY);
            } else {
                this.renderContent(renderer.context, x, y);
            }
        },

        renderContent: function(context, x, y) {
            // var prevTextAlign = context.textAlign;
            // var prevAlpha = context.globalAlpha;
            // context.globalAlpha = this.alpha;
            context.font = this.fontStyle;
            context.textAlign = this.alignH;

            if (this.textBaseline === "top") {
                context.textBaseline = 'alphabetic';
                y += this.fontSize;
            } else {
                context.textBaseline = this.textBaseline;
            }

            var bakShadow;
            if (this.shadowColor !== null) {
                bakShadow = {
                    blur: context.shadowBlur,
                    color: context.shadowColor,
                    offsetX: context.shadowOffsetX,
                    offsetY: context.shadowOffsetY,
                };
                context.shadowBlur = this.shadowBlur;
                context.shadowColor = this.shadowColor;
                context.shadowOffsetX = this.shadowOffsetX;
                context.shadowOffsetY = this.shadowOffsetY;

                // context.fillStyle = this.shadowColor;
                // this.renderLines(context, x + this.shadowOffsetX, y + this.shadowOffsetY, true);
            }

            if (this.color !== null) {
                context.fillStyle = this.color;
            }

            if (this.strokeColor !== null) {

                context.lineCap = this.lineCap;
                context.lineJoin = this.lineJoin;
                // TODO
                context.lineWidth = this.strokeWidth * 2;
                context.strokeStyle = this.strokeColor;
            }

            this.renderLines(context, x, y);

            this.textChanged = false;
            this._needToCompute = false;

            if (bakShadow) {
                context.shadowBlur = bakShadow.blur;
                context.shadowColor = bakShadow.color;
                context.shadowOffsetX = bakShadow.offsetX;
                context.shadowOffsetY = bakShadow.offsetY;
            }
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

    if (typeof module !== "undefined") {
        module.exports = TextHolder;
    }

}(CUI));
