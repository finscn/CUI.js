"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var Label = exports.Label;
    var ImageRenderer = exports.ImageRenderer;
    var TextRenderer = exports.TextRenderer;

    var ProgressBar = Class.create({

        composite: false,
        disabled: false,

        // 不指定宽高, 大小由 bgRenderer 的实际大小决定
        width: null,
        height: null,
        scaleBg: false,

        progress: 0,
        scaleValue: false,

        backgroundColor: "rgba(50,50,50,0.5)",
        borderColor: "rgba(50,50,50,1)",
        valueColor: "rgba(230,60,60,1)",

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            ProgressBar.$super.init.call(this);

            if (this.bgInfo) {
                this.bgRenderer = new ImageRenderer(this.bgInfo);
                this.bgRenderer.setParent(this);
                this.bgRenderer.init();
            }
            if (this.valueInfo) {
                this.valueRenderer = new ImageRenderer(this.valueInfo);
                this.valueRenderer.setParent(this);
                this.valueRenderer.init();
            }

            if (this.afterInit) {
                this.afterInit();
            }

        },

        computeWidth: Label.prototype.computeWidth,
        computeHeight: Label.prototype.computeHeight,

        computeLayout: function(forceCompute) {

            if (this.bgRenderer) {
                this.bgRenderer.updateSize();
                this.bgRenderer.updatePosition();
            }
            if (this.valueRenderer) {
                this.valueRenderer.updateSize();
                this.valueRenderer.updatePosition();
                if (!this.valueRenderer.orignSW) {
                    this.valueRenderer.orignSW = this.valueRenderer.sw;
                    this.valueRenderer.orignSH = this.valueRenderer.sh;
                    this.valueRenderer.orignWidth = this.valueRenderer.pixel.width;
                    this.valueRenderer.orignHeight = this.valueRenderer.pixel.height;
                }
            }

            this.updateAnchor();

            this.needToCompute = false;
        },

        syncPosition: function() {
            this.x = this.pixel.relativeX + this.parent.x;
            this.y = this.pixel.relativeY + this.parent.y;
            this.updateAABB();

            this.bgRenderer && this.bgRenderer.updatePosition();
            this.valueRenderer && this.valueRenderer.updatePosition();
        },

        renderSelf: function(context, timeStep, now) {
            var p = Math.min(1, this.progress);
            if (this.bgRenderer) {
                this.bgRenderer.quickRender(context);
            } else {
                context.fillStyle = this.backgroundColor;
                context.fillRect(this.x, this.y, this.w, this.h);
            }

            if (this.valueRenderer) {
                this.valueRenderer.sw = this.valueRenderer.orignSW * (this.scaleValue ? 1 : p);
                this.valueRenderer.pixel.width = this.valueRenderer.orignWidth * p;
                this.valueRenderer.quickRender(context);
            } else {
                context.fillStyle = this.valueColor;
                context.fillRect(this.x, this.y, this.w * p, this.h);
                context.strokeStyle = this.borderColor;
                context.strokeRect(this.x, this.y, this.w, this.h);
            }

        },

    }, Component);


    exports.ProgressBar = ProgressBar;

    if (typeof module != "undefined") {
        module.exports = ProgressBar;
    }

}(CUI));
