"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var ImageHolder = exports.ImageHolder;
    var TextHolder = exports.TextHolder;

    var Label = Class.create({
        superclass: Component,

        composite: false,
        disabled: false,

        // 不指定宽高, 大小由 backgroundHolder 的实际大小决定
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

            this.computeSelf(this.parent);
            this.computeSizeWithText();

        },

        setImageHolder: function(name, info) {
            if (!info) {
                this[name] = null;
            } else {
                if (!this[name]) {
                    this[name] = new ImageHolder(info);
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
                this.iconHolder = null;
            } else {
                if (!this.iconHolder) {
                    this.iconHolder = new ImageHolder(iconInfo);
                    this.iconHolder.setParent(this);
                    this.iconHolder.init();
                } else {
                    this.iconHolder.setImgInfo(iconInfo);
                }
            }
            this.needToCompute = true;
        },
        setFlagInfo: function(flagInfo) {
            if (!flagInfo) {
                this.flagHolder = null;
            } else {
                if (!this.flagHolder) {
                    this.flagHolder = new ImageHolder(flagInfo);
                    this.flagHolder.setParent(this);
                    this.flagHolder.init();
                } else {
                    this.flagHolder.setImgInfo(flagInfo);
                }
            }
            this.needToCompute = true;
        },
        setTextInfo: function(textInfo) {
            if (!this.textHolder) {
                this.textHolder = new TextHolder(textInfo);
                this.textHolder.setParent(this);
                this.textHolder.init();
            } else {
                this.textHolder.setTextInfo(textInfo);
            }
            this.needToCompute = true;
            this.needToComputeSize = true;
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

        setText: function(text, needToCompute) {
            this.textHolder.setText(text, needToCompute);
            this.needToCompute = needToCompute !== false;
            this.needToComputeSize = needToCompute !== false;
        },

        computeWidth: function() {
            var pixel = this.pixel;
            var autoWidth = this.width === null || this.width === "auto";

            if (autoWidth && (this.autoSizeWithText || !this.backgroundHolder)) {
                pixel.width = pixel.width || 0;
                this._autoSizeWithText = true;
            } else if (autoWidth && this.backgroundHolder) {
                pixel.width = this.backgroundHolder.w;
            } else {
                pixel.width = Utils.parseValue(this.width, pixel.realOuterWidth);
            }
            pixel.anchorX = Utils.parseValue(this.anchorX, pixel.width) || 0;
            pixel.width = pixel.width || this.sizeHolder;

            this.w = pixel.width;
            if (this.scaleBg) {
                // this.backgroundHolder.pixel.width = this.w;
                // this.backgroundHolder.pixel.sw = this.w;
                this.backgroundHolder.width = this.w;
            }
        },

        computeHeight: function() {
            var pixel = this.pixel;
            var autoHeight = this.height === null || this.height === "auto";

            if (autoHeight && (this.autoSizeWithText || !this.backgroundHolder)) {
                pixel.height = pixel.height || 0;
                this._autoSizeWithText = true;
            } else if (autoHeight && this.backgroundHolder) {
                pixel.height = this.backgroundHolder.h;
            } else {
                pixel.height = Utils.parseValue(this.height, pixel.realOuterHeight);
            }
            pixel.anchorY = Utils.parseValue(this.anchorY, pixel.height) || 0;
            pixel.height = pixel.height || this.sizeHolder;

            this.h = pixel.height;

            if (this.scaleBg) {
                // this.backgroundHolder.pixel.height = this.h;
                // this.backgroundHolder.pixel.sh = this.h;
                this.backgroundHolder.height = this.h;
            }
        },

        computeSizeWithText: function() {
            var measure = this.textHolder.measure;
            if (!measure) {
                return;
            }
            this.needToComputeSize = false;
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
                var textHeight = measure.height * this.textHolder.lineCount + extY;
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
            this.textHolder && this.textHolder.updatePosition();
            if (this.backgroundHolder) {
                this.backgroundHolder.updateSize();
                this.backgroundHolder.updatePosition();
            }
            if (this.iconHolder) {
                this.iconHolder.updateSize();
                this.iconHolder.updatePosition();
            }
            if (this.flagHolder) {
                this.flagHolder.updateSize();
                this.flagHolder.updatePosition();
            }

            this.updateAnchor();

            this.needToCompute = false;
        },

        syncPosition: function() {
            this.x = this.pixel.relativeX + this.parent.x;
            this.y = this.pixel.relativeY + this.parent.y;
            this.updateAABB();

            this.backgroundHolder && this.backgroundHolder.updatePosition();
            this.iconHolder && this.iconHolder.updatePosition();
            this.textHolder && this.textHolder.updatePosition();
            this.flagHolder && this.flagHolder.updatePosition();
        },

        renderSelf: function(renderer, timeStep, now) {
            if (this._autoSizeWithText && this.needToComputeSize && this.textHolder) {
                if (this.textHolder.needToCompute) {
                    this.textHolder.computeSize();
                }
                this.computeSizeWithText();
            }

            if (this.backgroundColor !== null) {
                renderer.setAlpha(this.backgroundAlpha);
                renderer.fillRect(this.x, this.y, this.w, this.h, this.backgroundColor, this.pixel);
                renderer.restoreAlpha();
            }
            if (this.backgroundHolder) {
                this.backgroundHolder.render(renderer, timeStep, now);
            }

            this.iconHolder && this.iconHolder.render(renderer, timeStep, now);
            this.textHolder && this.textHolder.render(renderer, timeStep, now);
            this.flagHolder && this.flagHolder.render(renderer, timeStep, now);

            if (this.borderWidth && this.borderColor !== null) {
                renderer.setAlpha(this.borderAlpha);
                var aabb = this.aabb;
                renderer.strokeRect(aabb[0], aabb[1], aabb[2] - aabb[0], aabb[3] - aabb[1], this.borderColor, this.borderWidth, this.pixel);
                // renderer.strokeRect(this.x, this.y, this.w, this.h, this.borderColor, this.borderWidth);
                renderer.restoreAlpha();
            }
        },

    });


    exports.Label = Label;

    if (typeof module != "undefined") {
        module.exports = Label;
    }

}(CUI));
