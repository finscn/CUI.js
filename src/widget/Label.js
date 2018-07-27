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

        initialize: function() {
            this.composite = false;
            this.disabled = false;

            // 不指定宽高, 大小由 backgroundHolder 的实际大小决定
            this.width = null;
            this.height = null;
            this.scaleBg = false;

            this.backgroundColor = null;
            this.borderWidth = 0;

            this.resizeWithText = true;

            this.sizeHolder = 0.0001;
            this.sizePadding = 2;
        },

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            Label.$super.init.call(this);

            this._sizeChanged = true;

            if (this.iconInfo) {
                this.setIconInfo(this.iconInfo);
            }
            if (this.flagInfo) {
                this.setFlagInfo(this.flagInfo);
            }
            this.initTextInfo();
            this.setTextInfo(this.textInfo);

            this.computeSelf(this.parent);
            this.computeSizeWithText(false);

            if (this.afterInit) {
                this.afterInit();
            }
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

        setTextColor: function(color) {
            this.textHolder.setColor(color);
        },

        initTextInfo: function() {
            var Me = this;
            Me.textInfo = Me.textInfo || {};

            var property = [
                "text",
                "color",
                "textAlign",
                "verticalAlign",
                "strokeColor",
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
            if (this.textInfo) {
                this.textInfo.text = text;
            }
            this.textHolder.setText(text);
            this.needToComputeSize = this.textHolder.textChanged;
            this.needToCompute = needToCompute !== false;
        },

        computeWidth: function() {
            var pixel = this.pixel;
            var autoWidth = this.width === null || this.width === "auto";
            var bg = this.backgroundHolder;

            if (autoWidth) {
                if (bg && !bg.borderImage) {
                    pixel.width = bg.w;
                } else {
                    pixel.width = pixel.width || 0;
                    this._sizeChanged = true;
                }
            } else {
                pixel.width = Utils.parseValue(this.width, pixel.realOuterWidth);
            }
            pixel.anchorX = Utils.parseValue(this.anchorX, pixel.width) || 0;
            pixel.width = pixel.width || this.sizeHolder;
            pixel.innerWidth = pixel.width - pixel.paddingLeft - pixel.paddingRight;
            this.w = pixel.width;
            if (bg && this.scaleBg) {
                // bg.pixel.width = this.w;
                bg.width = this.w;
            }
        },

        computeHeight: function() {
            var pixel = this.pixel;
            var autoHeight = this.height === null || this.height === "auto";
            var bg = this.backgroundHolder;

            if (autoHeight) {
                if (bg && !bg.borderImage) {
                    pixel.height = bg.h;
                } else {
                    pixel.height = pixel.height || 0;
                    this._sizeChanged = true;
                }
            } else {
                pixel.height = Utils.parseValue(this.height, pixel.realOuterHeight);
            }
            pixel.anchorY = Utils.parseValue(this.anchorY, pixel.height) || 0;
            pixel.height = pixel.height || this.sizeHolder;
            pixel.innerHeight = pixel.height - pixel.paddingTop - pixel.paddingBottom;
            this.h = pixel.height;

            if (bg && this.scaleBg) {
                // bg.pixel.height = this.h;
                bg.height = this.h;
            }
        },

        computeSizeWithText: function(immediately) {
            var measure = this.textHolder.measure;
            if (!measure) {
                return;
            }
            this.needToComputeSize = false;
            this._sizeChanged = false;
            var needToCompute = false;
            // var ext = this.sizePadding * 2 + this.borderWidth;
            var extX = this.borderWidth + this.paddingLeft + this.paddingRight + this.textHolder.offsetX;
            var extY = this.borderWidth + this.paddingTop + this.paddingBottom + this.textHolder.offsetY;
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
                var bg = this.backgroundHolder;
                if (bg && bg.borderImage) {
                    bg.width = this.w;
                    bg.height = this.h;
                    bg.w = this.w;
                    bg.h = this.h;
                    bg.cacheCanvas = null;
                }

                this.setReflow("parent", immediately);
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

        syncHolders: function() {
            this.backgroundHolder && this.backgroundHolder.updatePosition();
            this.iconHolder && this.iconHolder.updatePosition();
            this.textHolder && this.textHolder.updatePosition();
            this.flagHolder && this.flagHolder.updatePosition();
        },

        renderSelf: function(renderer, timeStep, now) {
            if (this.textHolder && (this.resizeWithText || this._sizeChanged) && this.needToComputeSize) {
                // if (this.textHolder.needToCompute) {
                this.textHolder.computeSize();
                // }
                this.computeSizeWithText(true);
            }

            if (this.backgroundColor !== null) {
                renderer.setAlpha(this.backgroundAlpha);
                renderer.fillRect(this.x, this.y, this.w, this.h, this.backgroundColor);
                renderer.restoreAlpha();
            }

            this.backgroundHolder && this.backgroundHolder.render(renderer, timeStep, now);

            this.iconHolder && this.iconHolder.render(renderer, timeStep, now);
            this.textHolder && this.textHolder.render(renderer, timeStep, now);
            this.flagHolder && this.flagHolder.render(renderer, timeStep, now);

            if (this.borderWidth && this.borderColor !== null) {
                renderer.setAlpha(this.borderAlpha);
                var aabb = this.aabb;
                renderer.strokeRect(aabb[0], aabb[1], aabb[2] - aabb[0], aabb[3] - aabb[1], this.borderWidth, this.borderColor);
                // renderer.strokeRect(this.x, this.y, this.w, this.h, this.borderWidth, this.borderColor);
                renderer.restoreAlpha();
            }
        },

    });


    exports.Label = Label;

    if (typeof module !== "undefined") {
        module.exports = Label;
    }

}(CUI));
