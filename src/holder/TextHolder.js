"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;
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

            this.width = "auto";
            this.height = "auto";
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
            this.textWidth = 0;
            this.textHeight = 0;

            this.areaWidth = 0;
            this.areaHeight = 0;
            this.areaOffsetX = 0;
            this.areaOffsetY = 0;

            this.cachePadding = 2;
            this.useCache = true;
            this.useCachePool = true;

            this.linkCache = null;

            this.lineHeight = 0;
        },

        init: function() {

            this.id = this.id || "text-holder-" + this.parent.id;

            if (this.linkCache) {
                this.useCache = true;
            }

            this.setTextInfo(this);

            this.initDisplayObject();

            this.updateText();
            // this.updateSize();
            // this.updatePosition();
        },

        createCache: function() {
            if (!this.cacheCanvas) {
                if (this.useCachePool) {
                    this.cacheCanvas = Core.getCanvasFromPool(this.id);
                } else {
                    this.cacheCanvas = document.createElement("canvas");
                }
            }
            // document.body.appendChild(this.cacheCanvas)
            this.cacheContext = this.cacheCanvas.getContext('2d');
        },

        initDisplayObject: function() {
            if (this.useCache === true || !this.parent.root.renderer.canvas2d) {
                this._displayOffsetX = -this.cachePadding;
                this._displayOffsetY = -this.cachePadding;

                if (this.linkCache) {
                    this.displayObject = this.parent.root.renderer.createSprite(this.linkCache);
                } else {
                    this.createCache();
                    this.displayObject = this.parent.root.renderer.createTextObject(this.cacheContext);
                }
            } else {
                this.displayObject = this.parent.root.renderer.createTextObject();
                this.displayObject.textInfo = this;
            }
            this.syncDisplayObject();

            if (this.parent) {
                this.parent.addChildDisplayObject(this);
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
            this.textChanged = this._text !== text;
            if (!this.textChanged) {
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
            this._needToCompute = true;
        },

        updateText: function() {
            if (!this.lines) {
                // this._needToCompute = false;
                return;
            }

            if (!this.lineHeight) {
                this.lineHeight = Math.ceil(this.fontSize * 1.25) + (this.strokeWidth || 1) + 2;
            }

            // if (this._width === "auto" || this._height === "auto") {
            if (this._width === "auto") {
                var measure = CUI.Utils.measureText(this.lines, this.fontStyle);
                this.measure = measure || {
                    width: 0,
                };
            } else {
                this.measure = {
                    width: this._width,
                }
            }

            if (this._height === "auto") {
                this.measure.height = this.lineHeight * this.lineCount;
            } else {
                this.measure.height = this._height;
            }

            this.textWidth = this.measure.width;
            this.textHeight = this.measure.height;

            this.updateArea();

            this._needToCompute = true;
        },

        updateArea: function() {
            if (this.linkCache) {
                this.areaWidth = this.linkCache.width;
                this.areaHeight = this.linkCache.height;
                return;
            }

            this.areaWidth = this.textWidth + this.strokeWidth; // * 2;
            this.areaHeight = this.textHeight + this.strokeWidth; // * 2;
            // debugger
            if (this.useCache === true || !this.parent.root.renderer.canvas2d) {
                this.areaWidth += this.cachePadding * 2;
                this.areaHeight += this.cachePadding * 2;

                // this.areaOffsetX = this.cachePadding;
                // this.areaOffsetY = this.cachePadding;

                if (this.alignH === "center") {
                    this.areaOffsetX = Math.round(this.areaWidth / 2);
                } else if (this.alignH === "right" || this.alignH === "end") {
                    this.areaOffsetX = this.areaWidth - this.cachePadding;
                } else {
                    this.areaOffsetX = this.cachePadding;
                }

                // this.areaOffsetX += this.strokeWidth / 2;
                // this.areaOffsetY += this.strokeWidth / 2;

                this.cacheCanvas.width = this.areaWidth;
                this.cacheCanvas.height = this.areaHeight;

                CUI.Utils.renderTextContent(this.cacheContext, this, this.areaOffsetX, this.areaOffsetY, true);

                // TEST
                // this.cacheContext.strokeStyle = "#ff00ff";
                // this.cacheContext.lineWidth = 8;
                // this.cacheContext.strokeRect(0, 0, this.areaWidth, this.areaHeight);
            }

            this.displayObject.updateSize();
            // this.displayObject.updateContent();
        },

        computeWidth: function() {
            this.pixel.width = this.areaWidth;
            this.absoluteWidth = this.areaWidth;
        },
        computeHeight: function() {
            this.pixel.height = this.areaHeight;
            this.absoluteHeight = this.areaHeight;
        },

        update: function(forceCompute) {
            if (this._sizeChanged || this._positionChanged || this._needToCompute || forceCompute) {
                this.updateSize();
                this.updatePosition();

                this._sizeChanged = false;
                this._positionChanged = false;
                this._needToCompute = false;
            }
        },
    });

    exports.TextHolder = TextHolder;

    if (typeof module !== "undefined") {
        module.exports = TextHolder;
    }

}(CUI));
