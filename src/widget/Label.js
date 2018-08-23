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
            this.id = this.id || "label_" + Component._SN++;

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.initBase();

            this._sizeChanged = true;

            if (this.iconInfo) {
                this.iconHolder = this.addImageHolder(this.iconInfo);
            }

            this.initTextInfo();
            this.setTextInfo(this.textInfo);

            this.computeTextSize();
            this.computeSelf();

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
                    this[name].parent = this;
                    this[name].init();
                } else {
                    this[name].setImageInfo(info);
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
                    this.iconHolder.parent = this;
                    this.iconHolder.init();
                } else {
                    this.iconHolder.setImageInfo(iconInfo);
                }
            }
            this._needToCompute = true;
        },

        setTextInfo: function(textInfo) {
            if (!this.textHolder) {
                this.textHolder = new TextHolder(textInfo);
                this.textHolder.parent = this;
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
            var autoWidth = this.width === "auto";
            var bg = this.backgroundHolder;

            if (autoWidth) {
                if (this.resizeWithText) {
                    pixel.width = this.textHolder ? this.textHolder.cacheWidth : this.textWidth;
                } else if (bg && !bg.borderImage) {
                    pixel.width = bg.w;
                } else {
                    pixel.width = pixel.width || 0;
                    this._sizeChanged = true;
                }
            } else {
                pixel.width = Utils.parseValue(this.width, pixel.realOuterWidth);
            }
            pixel.width = pixel.width || this.sizeHolder;
            pixel.innerWidth = pixel.width - pixel.paddingLeft - pixel.paddingRight;
            this.absoluteWidth = pixel.width;

            if (bg && this.scaleBg) {
                bg.pixel.width = this._absoluteWidth;
                bg.absoluteWidth = this._absoluteWidth;
            }
        },

        computeHeight: function() {
            var pixel = this.pixel;
            var autoHeight = this.height === "auto";
            var bg = this.backgroundHolder;

            if (autoHeight) {
                if (this.resizeWithText) {
                    pixel.height = this.textHolder ? this.textHolder.cacheHeight : this.textHeight;
                } else if (bg && !bg.borderImage) {
                    pixel.height = bg.h;
                } else {
                    pixel.height = pixel.height || 0;
                    this._sizeChanged = true;
                }
            } else {
                pixel.height = Utils.parseValue(this.height, pixel.realOuterHeight);
            }
            pixel.height = pixel.height || this.sizeHolder;
            pixel.innerHeight = pixel.height - pixel.paddingTop - pixel.paddingBottom;
            this.absoluteHeight = pixel.height;

            if (bg && this.scaleBg) {
                bg.pixel.height = this._absoluteHeight;
                bg.absoluteHeight = this._absoluteHeight;
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
            this._needToCompute = false;

            if (this.textHolder) {
                this.textHolder.updateSize();
                this.textHolder.updatePosition();
                this.textHolder.update();
            }

            this.updateHolders();
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

            // this.tryToReflow(this.reflow);
            // if (resizeWithText) {
            //     // this.tryToReflow(this.reflow, true);
            //     this.tryToReflow(this.reflow);
            // } else {
            //     this.computeSelf();
            //     this.computeLayout(true);
            // }
            this.computeSelf();
            this.computeLayout(true);

            this._needToComputeSize = false;
            this._sizeChanged = false;
        },

        update: function(timeStep, now) {
            this.beforeUpdate && this.beforeUpdate(timeStep, now);
            // if (this._needToCompute) {
            //     console.log(this.id, "label needToCompute");
            // }
            this.updateSelf(timeStep, now);

            if (this.textHolder && (this.resizeWithText || this._sizeChanged) && this._needToComputeSize) {
                this.updateSizeWithText();
            } else {
                this.computeLayout();
            }
            this.afterUpdate && this.afterUpdate(timeStep, now);
        },
    });


    exports.Label = Label;

    if (typeof module !== "undefined") {
        module.exports = Label;
    }

}(CUI));
