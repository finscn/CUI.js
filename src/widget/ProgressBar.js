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
            if (!this._needToCompute && !forceCompute) {
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

            this._needToCompute = false;
        },

        syncHolders: function() {
            if (this.backgroundHolder) {
                this.backgroundHolder.updateSize();
                this.backgroundHolder.updatePosition();
            }
            if (this.valueHolder) {
                this.valueHolder.updateSize();
                this.valueHolder.updatePosition();
            }
        },
    });


    exports.ProgressBar = ProgressBar;

    if (typeof module !== "undefined") {
        module.exports = ProgressBar;
    }

}(CUI));
