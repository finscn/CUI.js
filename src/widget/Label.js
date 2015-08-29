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

        autoSizeWithText: true,

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            Label.$super.init.call(this);

            if (this.bgInfo) {
                this.bgRenderer = new ImageRenderer(this.bgInfo);
                this.bgRenderer.setParent(this);
                this.bgRenderer.init();
            }
            if (this.iconInfo) {
                this.iconRenderer = new ImageRenderer(this.iconInfo);
                this.iconRenderer.setParent(this);
                this.iconRenderer.init();
            }
            this.initTextInfo();
            this.textRenderer = new TextRenderer(this.textInfo);
            this.textRenderer.setParent(this);
            this.textRenderer.init();

            if (this.afterInit) {
                this.afterInit();
            }

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
                if ( !(p in Me.textInfo) && (p in Me)) {
                    Me.textInfo[p] = Me[p];
                }
            });
        },

        computeWidth: function() {
            var pixel = this.pixel;
            if (this.bgRenderer && (this.width === null || this.width === "auto")) {
                pixel.width = this.bgRenderer.sw;
            } else {
                pixel.width = Utils.parseValue(this.width, pixel.realOuterWidth);
            }
            pixel.anchorX = Utils.parseValue(this.anchorX, pixel.width) || 0;
            this.w = pixel.width;
            if (this.scaleBg) {
                this.bgRenderer.pixel.width = this.w;
            }
        },
        computeHeight: function() {
            var pixel = this.pixel;
            if (this.bgRenderer && (this.width === null || this.width === "auto")) {
                pixel.height = this.bgRenderer.sh;
            } else {
                pixel.height = Utils.parseValue(this.height, pixel.realOuterHeight);
            }
            pixel.anchorY = Utils.parseValue(this.anchorY, pixel.height) || 0;
            this.h = pixel.height;

            if (this.scaleBg) {
                this.bgRenderer.pixel.height = this.h;
            }
        },

        computeSizeWithText: function() {
            var measure = this.textRenderer.measure;
            if (!measure) {
                return;
            }
            var needToCompute = false;
            if (this.width === null || this.width === "auto") {
                this.pixel.width = measure.width;
                this.w = measure.width;
                needToCompute = true;
            }
            if (this.height === null || this.height === "auto") {
                this.pixel.height = measure.height;
                this.h = measure.height;
                needToCompute = true;
            }
            if (needToCompute) {
                this.computeLayout();
            }
        },

        setText: function(text) {
            this.textRenderer.setText(text);
        },
        setTextInfo: function(textInfo) {
            this.textRenderer.setTextInfo(textInfo);
        },

        computeLayout: function(forceCompute) {
            if (this.bgRenderer) {
                this.bgRenderer.updateSize();
                this.bgRenderer.updatePosition();
            }
            if (this.iconRenderer) {
                this.iconRenderer.updateSize();
                this.iconRenderer.updatePosition();
            }
            this.textRenderer && this.textRenderer.updatePosition();

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
        },

        renderSelf: function(context, timeStep, now) {
            if (this.textRenderer) {
                if (this.textRenderer.needToCompute) {
                    this.textRenderer.computeSize(context);
                    if (this.autoSizeWithText) {
                        this.computeSizeWithText();
                    }
                }
            }
            if (this.backgroundColor) {
                context.fillStyle = this.backgroundColor;
                context.fillRect(this.x, this.y, this.w, this.h);
            }
            this.bgRenderer && this.bgRenderer.render(context);
            this.iconRenderer && this.iconRenderer.render(context);
            this.textRenderer && this.textRenderer.render(context);

            if (this.borderColor && this.borderWidth) {
                context.lineWidth = this.borderWidth;
                context.strokeStyle = this.borderColor;
                context.strokeRect(this.x, this.y, this.w, this.h);
            }
        },

    }, Component);


    exports.Label = Label;

    if (typeof module != "undefined") {
        module.exports = Label;
    }

}(CUI));
