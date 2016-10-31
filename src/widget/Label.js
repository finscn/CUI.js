"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var ImageRenderer = exports.ImageRenderer;
    var TextRenderer = exports.TextRenderer;

    var Label = Class.create({

        composite: false,
        disabled: false,

        // 不指定宽高, 大小由 bgRenderer 的实际大小决定
        width: null,
        height: null,
        scaleBg: false,

        backgroundColor: null,
        borderWidth: 0,

        autoSizeWithText: false,

        sizeHolder: 0.0001,
        sizePadding: 2,

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            Label.$super.init.call(this);

            this.initBgInfo();

            if (this.iconInfo) {
                this.setIconInfo(this.iconInfo);
            }
            if (this.flagInfo) {
                this.setFlagInfo(this.flagInfo);
            }
            this.initTextInfo();
            this.setTextInfo(this.textInfo);

            if (this.afterInit) {
                this.afterInit();
            }

            this.needToCompute = true;

        },

        setImageRenderer: function(name, info) {
            if (!info) {
                this[name] = null;
            } else {
                if (!this[name]) {
                    this[name] = new ImageRenderer(info);
                    this[name].setParent(this);
                    this[name].init();
                } else {
                    this[name].setImgInfo(info);
                }
            }
            this.needToCompute = true;
        },

        setIconInfo: function(iconInfo) {
            if (!iconInfo) {
                this.iconRenderer = null;
            } else {
                if (!this.iconRenderer) {
                    this.iconRenderer = new ImageRenderer(iconInfo);
                    this.iconRenderer.setParent(this);
                    this.iconRenderer.init();
                } else {
                    this.iconRenderer.setImgInfo(iconInfo);
                }
            }
            this.needToCompute = true;
        },
        setFlagInfo: function(flagInfo) {
            if (!flagInfo) {
                this.flagRenderer = null;
            } else {
                if (!this.flagRenderer) {
                    this.flagRenderer = new ImageRenderer(flagInfo);
                    this.flagRenderer.setParent(this);
                    this.flagRenderer.init();
                } else {
                    this.flagRenderer.setImgInfo(flagInfo);
                }
            }
            this.needToCompute = true;
        },
        setTextInfo: function(textInfo) {
            if (!this.textRenderer) {
                this.textRenderer = new TextRenderer(textInfo);
                this.textRenderer.setParent(this);
                this.textRenderer.init();
            } else {
                this.textRenderer.setTextInfo(textInfo);
            }
            this.needToCompute = true;
        },

        initTextInfo: function() {
            var Me = this;
            Me.textInfo = Me.textInfo || {};

            var property = [
                "text",
                "color",
                "textAlign",
                "verticalAlign",
                "strokeWidth",
                "fontSize",
                "fontWeight",
                "fontStyle",
                "fontName",
                "lineHeight",
            ];
            property.forEach(function(p) {
                if (!(p in Me.textInfo) && (p in Me)) {
                    Me.textInfo[p] = Me[p];
                }
            });
        },

        setText: function(text) {
            this.textRenderer.setText(text);
        },

        computeWidth: function() {
            var pixel = this.pixel;
            var autoWidth = this.width === null || this.width === "auto";

            if (autoWidth && (this.autoSizeWithText || !this.bgRenderer)) {
                pixel.width = pixel.width || 0;
                this._autoSizeWithText = true;
            } else if (autoWidth && this.bgRenderer) {
                pixel.width = this.bgRenderer.w;
            } else {
                pixel.width = Utils.parseValue(this.width, pixel.realOuterWidth);
            }
            pixel.anchorX = Utils.parseValue(this.anchorX, pixel.width) || 0;
            pixel.width = pixel.width || this.sizeHolder;

            this.w = pixel.width;
            if (this.scaleBg) {
                // this.bgRenderer.pixel.width = this.w;
                // this.bgRenderer.pixel.sw = this.w;
                this.bgRenderer.width = this.w;
            }
        },

        computeHeight: function() {
            var pixel = this.pixel;
            var autoHeight = this.height === null || this.height === "auto";

            if (autoHeight && (this.autoSizeWithText || !this.bgRenderer)) {
                pixel.height = pixel.height || 0;
                this._autoSizeWithText = true;
            } else if (autoHeight && this.bgRenderer) {
                pixel.height = this.bgRenderer.h;
            } else {
                pixel.height = Utils.parseValue(this.height, pixel.realOuterHeight);
            }
            pixel.anchorY = Utils.parseValue(this.anchorY, pixel.height) || 0;
            pixel.height = pixel.height || this.sizeHolder;

            this.h = pixel.height;

            if (this.scaleBg) {
                // this.bgRenderer.pixel.height = this.h;
                // this.bgRenderer.pixel.sh = this.h;
                this.bgRenderer.height = this.h;
            }
        },

        computeSizeWithText: function() {
            var measure = this.textRenderer.measure;
            if (!measure) {
                return;
            }
            var needToCompute = false;
            // var ext = this.sizePadding * 2 + this.borderWidth;
            var extX = this.borderWidth + this.paddingLeft + this.paddingRight;
            var extY = this.borderWidth + this.paddingTop + this.paddingBottom;
            if (this.width === null || this.width === "auto") {
                var textWidth = measure.width + extX;
                this.pixel.width = textWidth;
                this.w = textWidth;
                needToCompute = true;
            }
            if (this.height === null || this.height === "auto") {
                var textHeight = measure.height * this.textRenderer.lineCount + extY;
                this.pixel.height = textHeight;
                this.h = textHeight;
                needToCompute = true;
            }
            if (needToCompute) {
                this.setReflow("parent", true);
            }
        },

        computeLayout: function(forceCompute) {
            if (!this.needToCompute && !forceCompute) {
                return;
            }
            this.textRenderer && this.textRenderer.updatePosition();
            if (this.bgRenderer) {
                this.bgRenderer.updateSize();
                this.bgRenderer.updatePosition();
            }
            if (this.iconRenderer) {
                this.iconRenderer.updateSize();
                this.iconRenderer.updatePosition();
            }
            if (this.flagRenderer) {
                this.flagRenderer.updateSize();
                this.flagRenderer.updatePosition();
            }

            this.updateAnchor();

            this.needToCompute = false;
        },

        syncPosition: function() {
            this.x = this.pixel.relativeX + this.parent.x;
            this.y = this.pixel.relativeY + this.parent.y;
            this.updateAABB();

            this.bgRenderer && this.bgRenderer.updatePosition();
            this.iconRenderer && this.iconRenderer.updatePosition();
            this.textRenderer && this.textRenderer.updatePosition();
            this.flagRenderer && this.flagRenderer.updatePosition();
        },

        renderSelf: function(context, timeStep, now) {
            if (this._autoSizeWithText && this.textRenderer) {
                if (this.textRenderer.needToCompute) {
                    this.textRenderer.computeSize(context);
                    // if (this.autoSizeWithText) {
                    this.computeSizeWithText();
                    // }
                }
            }
            if (this.backgroundColor) {
                context.fillStyle = this.backgroundColor;
                context.fillRect(this.x, this.y, this.w, this.h);
            }
            if (this.borderImageInfo) {
                this.renderBorderImage(context);
            }
            this.bgRenderer && this.bgRenderer.render(context);
            this.iconRenderer && this.iconRenderer.render(context);
            this.textRenderer && this.textRenderer.render(context);
            this.flagRenderer && this.flagRenderer.render(context);

            if (this.borderWidth && this.borderColor) {
                context.lineWidth = this.borderWidth;
                context.strokeStyle = this.borderColor;
                // context.strokeRect(this.x, this.y, this.w, this.h);
                var aabb = this.aabb;
                context.strokeRect(aabb[0], aabb[1], aabb[2] - aabb[0], aabb[3] - aabb[1]);
            }
        },

    }, Component);


    exports.Label = Label;

    if (typeof module != "undefined") {
        module.exports = Label;
    }

}(CUI));
