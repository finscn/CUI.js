"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Component = exports.Component;
    var ImageRenderer = exports.ImageRenderer;
    var TextRenderer = exports.TextRenderer;

    var Label = Class.create({

        composite: false,
        disabled: false,

        // 不指定宽高, 大小由 bgRenderer 的实际大小决定
        width: null,
        height: null,

        init: function() {

            if (this.bgInfo) {
                this.bgRenderer = new ImageRenderer(this.bgInfo);
                this.bgRenderer.setParent(this);
                this.bgRenderer.init();

                if (this.width === null || this.width === "auto") {
                    this.width = this.bgRenderer.sw;
                }

                if (this.height === null || this.height === "auto") {
                    this.height = this.bgRenderer.sh;
                }
            }

            Label.$super.init.call(this);

            if (this.iconInfo) {
                this.iconRenderer = new ImageRenderer(this.iconInfo);
                this.iconRenderer.setParent(this);
                this.iconRenderer.init();
            }
            if (this.textInfo) {
                this.textRenderer = new TextRenderer(this.textInfo);
                this.textRenderer.setParent(this);
                this.textRenderer.init();
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
                    this.compositeSizeWithText();
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
