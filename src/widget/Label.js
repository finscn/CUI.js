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

            if (this.borderHolder) {
                this.borderHolder.updateSize = this.borderHolder.updateSizeWithParentAABB;
            }

            this._sizeChanged = true;

            if (this.iconInfo) {
                this.setIconInfo(this.iconInfo);
            }
            if (this.flagInfo) {
                this.setFlagInfo(this.flagInfo);
            }
            this.initTextInfo();
            this.setTextInfo(this.textInfo);

            this.computeTextSize();
            this.computeSelf(this.parent);

            this.setDisabled(this.disabled);

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
            this._needToCompute = true;
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
            this._needToCompute = true;
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
            this._needToCompute = true;
        },

        setTextInfo: function(textInfo) {
            if (!this.textHolder) {
                this.textHolder = new TextHolder(textInfo);
                this.textHolder.setParent(this);
                this.textHolder.init();
            } else {
                this.textHolder.setTextInfo(textInfo);
            }
            this._needToCompute = true;
            this._needToComputeSize = true;
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
            this._needToComputeSize = this.textHolder.textChanged;
            this._needToCompute = needToCompute !== false;
        },

        updateText: function(text) {
            this.setText(text, true);
            this.updateSizeWithText();
        },

        computeWidth: function() {
            var pixel = this.pixel;
            var autoWidth = this.width === null || this.width === "auto";
            var bg = this.backgroundHolder;

            if (autoWidth) {
                if (this.resizeWithText) {
                    pixel.width = this.textWidth;
                } else if (bg && !bg.borderImage) {
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
                bg.pixel.width = this.w;
                // bg.width = this.w;
            }
        },

        computeHeight: function() {
            var pixel = this.pixel;
            var autoHeight = this.height === null || this.height === "auto";
            var bg = this.backgroundHolder;

            if (autoHeight) {
                if (this.resizeWithText) {
                    pixel.height = this.textHeight;
                } else if (bg && !bg.borderImage) {
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
                bg.pixel.height = this.h;
                // bg.height = this.h;
            }
        },

        computeTextSize: function(immediately) {
            var measure = this.textHolder.measure;
            if (!measure) {
                return;
            }

            // var ext = this.sizePadding * 2 + this.borderWidth;
            var extX = this.borderWidth + this.paddingLeft + this.paddingRight + this.textHolder.offsetX;
            var extY = this.borderWidth + this.paddingTop + this.paddingBottom + this.textHolder.offsetY;
            this.textWidth = measure.width + extX;
            this.textHeight = measure.height * this.textHolder.lineCount + extY;
        },

        computeLayout: function(forceCompute) {

            if (!this._needToCompute && !forceCompute) {
                return;
            }

            this.textHolder && this.textHolder.updatePosition();

            if (this.backgroundHolder) {
                this.backgroundHolder.updateSize();
                this.backgroundHolder.updatePosition();
            }

            if (this.borderHolder) {
                this.borderHolder.updateSize();
                this.borderHolder.updatePosition();
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

            this._needToCompute = false;
        },

        syncHolders: function() {
            if (this.backgroundHolder) {
                this.backgroundHolder.updateSize();
                this.backgroundHolder.updatePosition();
            }
            if (this.borderHolder) {
                this.borderHolder.updateSize();
                this.borderHolder.updatePosition();
            }
            if (this.iconHolder) {
                this.iconHolder.updateSize();
                this.iconHolder.updatePosition();
            }
            if (this.textHolder) {
                this.textHolder.updateSize();
                this.textHolder.updatePosition();
            }
            if (this.flagHolder) {
                this.flagHolder.updateSize();
                this.flagHolder.updatePosition();
            }
        },

        updateSizeWithText: function() {
            // if (this.textHolder._needToCompute) {
            this.textHolder.computeSize();
            // }

            this.computeTextSize();

            var bg = this.backgroundHolder;
            if (bg && bg.borderImage) {
                bg.cacheCanvas = null;
            }

            this.setReflow("parent", true);

            this._needToComputeSize = false;
            this._sizeChanged = false;
        },

        update: function(timeStep, now) {
            this.beforeUpdate && this.beforeUpdate(timeStep, now);

            this.updateSelf(timeStep, now);

            if (this.textHolder && (this.resizeWithText || this._sizeChanged) && this._needToComputeSize) {
                this.updateSizeWithText();
            } else {
                this.computeLayout();
            }

            this.afterUpdate && this.afterUpdate(timeStep, now);
        },

        renderSelf: function(renderer, timeStep, now) {
            this.backgroundHolder && this.backgroundHolder.render(renderer, timeStep, now);
            this.borderHolder && this.borderHolder.render(renderer, timeStep, now);
            this.iconHolder && this.iconHolder.render(renderer, timeStep, now);
            this.textHolder && this.textHolder.render(renderer, timeStep, now);
            this.flagHolder && this.flagHolder.render(renderer, timeStep, now);
        },

    });


    exports.Label = Label;

    if (typeof module !== "undefined") {
        module.exports = Label;
    }

}(CUI));
