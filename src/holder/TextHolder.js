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

            this.useCache = true;
            this.cacheWidth = 0;
            this.cacheHeight = 0;
            this.cacheOffsetX = 0;
            this.cacheOffsetY = 0;
            this.cachePadding = 4;
            this.useCachePool = true;
            this.shareCache = false;

            this.lineHeight = 0;
        },

        init: function() {

            this.id = this.id || "text-holder-" + this.parent.id;

            this.setTextInfo(this);

            this.initDisplayObject();

            this.computeSize();
            // this.updateSize();
            // this.updatePosition();
        },

        createCache: function() {
            if (!this.cacheCanvas) {
                if (this.shareCache) {
                    this.cacheCanvas = TextHolder.cacheCanvas;
                } else if (this.useCachePool) {
                    this.cacheCanvas = Core.getCanvasFromPool(this.id);
                } else {
                    this.cacheCanvas = document.createElement("canvas");
                }
            }
            // document.body.appendChild(this.cacheCanvas)
            this.cacheContext = this.cacheCanvas.getContext('2d');
        },

        initDisplayObject: function() {
            if (this.useCache) {
                this.createCache();
                this.displayObject = this.parent.root.renderer.createTextObject(this.cacheContext);
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

            if (force || (this._width === "auto" || this._height === "auto")) {
                var ctx = textContext;
                ctx.font = this.fontStyle;
                var measure = ctx.measureText(this.lines[0]);
                measure.height = Math.ceil(this.fontSize * 1.5) + (this.strokeWidth || 1) + 2;
                this.measure = measure;
                this.lineHeight = this.lineHeight || measure.height;
                this.textWidth = measure.width;
            } else {
                this.lineHeight = this.lineHeight || this.height;
                this.measure = {
                    width: this.width,
                    height: this.lineHeight,
                }
            }

            this.textHeight = this.lineHeight * this.lineCount;

            // TODO
            // this.updatePosition();

            // this._needToCompute = false;

            if (this.useCache) {
                if (this.alignH === "center") {
                    this.cacheOffsetX = Math.ceil(this.textWidth / 2 + this.strokeWidth + this.cachePadding);
                } else if (this.alignH === "right" || this.alignH === "end") {
                    this.cacheOffsetX = this.textWidth + this.strokeWidth + this.cachePadding;
                } else {
                    this.cacheOffsetX = this.strokeWidth + this.cachePadding;
                }
                this.cacheOffsetY = this.strokeWidth + this.cachePadding;

                this.cacheWidth = this.textWidth + (this.strokeWidth + this.cachePadding) * 2;
                this.cacheHeight = this.textHeight + (this.strokeWidth + this.cachePadding) * 2;
                // debugger
                this.updateCache();
                this.displayObject.updateSize();
                // this.displayObject.updateContent();
            }

            // this.pixel.width = this.cacheWidth;
            // this.pixel.height = this.cacheHeight;

        },
        computeAutoWidth: function() {
            this.pixel.width = this.cacheWidth;
        },
        computeAutoHeight: function() {
            this.pixel.height = this.cacheHeight;
        },
        updateCache: function() {
            this.cacheCanvas.width = this.cacheWidth;
            this.cacheCanvas.height = this.cacheHeight;

            CUI.Utils.renderContent(this.cacheContext, this, this.cacheOffsetX, this.cacheOffsetY);

            this.textChanged = false;
            // this._needToCompute = false;

            // this.cacheContext.lineWidth = 4;
            // this.cacheContext.strokeRect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
        },

        update: function() {
            if (this._sizeChanged || this._positionChanged || this._needToCompute) {
                this.updateSize();
                this.updatePosition();

                this._sizeChanged = false;
                this._positionChanged = false;
                this._needToCompute = false;
            }
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
