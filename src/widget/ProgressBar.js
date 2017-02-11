"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var Label = exports.Label;
    var ImageHolder = exports.ImageHolder;
    var TextHolder = exports.TextHolder;

    var ProgressBar = Class.create({
        superclass: Component,

        initialize: function() {
            this.composite = false;
            this.disabled = false;

            // 不指定宽高, 大小由 backgroundHolder 的实际大小决定
            this.width = null;
            this.height = null;
            this.scaleBg = false;

            this.progress = 0;
            this.scaleValue = false;

            this.backgroundColor = "rgba(50,50,50,0.5)";
            this.borderColor = "rgba(50,50,50,1)";
            this.valueColor = "rgba(230,60,60,1)";
        },

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            ProgressBar.$super.init.call(this);

            if (this.valueInfo) {
                this.valueHolder = new ImageHolder(this.valueInfo);
                this.valueHolder.setParent(this);
                this.valueHolder.init();
            }

            if (this.afterInit) {
                this.afterInit();
            }

        },

        computeWidth: Label.prototype.computeWidth,
        computeHeight: Label.prototype.computeHeight,

        computeLayout: function(forceCompute) {
            if (!this.needToCompute && !forceCompute) {
                return;
            }
            if (this.backgroundHolder) {
                this.backgroundHolder.updateSize();
                this.backgroundHolder.updatePosition();
            }
            if (this.valueHolder) {
                this.valueHolder.updateSize();
                this.valueHolder.updatePosition();
                if (!this.valueHolder.orignSW) {
                    this.valueHolder.orignSW = this.valueHolder.sw;
                    this.valueHolder.orignSH = this.valueHolder.sh;
                    this.valueHolder.orignWidth = this.valueHolder.pixel.width;
                    this.valueHolder.orignHeight = this.valueHolder.pixel.height;
                }
            }

            this.updateAnchor();

            this.needToCompute = false;
        },

        syncPosition: function() {
            this.x = this.pixel.relativeX + this.parent.x;
            this.y = this.pixel.relativeY + this.parent.y;
            this.updateAABB();

            this.backgroundHolder && this.backgroundHolder.updatePosition();
            this.valueHolder && this.valueHolder.updatePosition();
        },

        renderSelf: function(renderer, timeStep, now) {
            var p = Math.min(1, this.progress);
            if (this.backgroundHolder) {
                this.backgroundHolder.simpleRender(renderer, timeStep, now);
            } else {
                renderer.fillRect(this.x, this.y, this.w, this.h, this.backgroundColor, this.pixel);
            }

            if (this.valueHolder) {
                this.valueHolder.sw = this.valueHolder.orignSW * (this.scaleValue ? 1 : p);
                this.valueHolder.pixel.width = this.valueHolder.orignWidth * p;
                this.valueHolder.simpleRender(renderer, timeStep, now);
            } else {
                renderer.fillRect(this.x, this.y, this.w * p, this.h, this.valueColor, this.pixel);
                renderer.strokeRect(this.x, this.y, this.w, this.h, this.borderColor, 2, this.pixel);
            }

        },

    });


    exports.ProgressBar = ProgressBar;

    if (typeof module != "undefined") {
        module.exports = ProgressBar;
    }

}(CUI));
