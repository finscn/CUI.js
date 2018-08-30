"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Component = exports.Component;
    var ImageHolder = exports.ImageHolder;
    var TextHolder = exports.TextHolder;

    var Label = Class.create({
        superclass: Component,

        initialize: function() {
            this.composite = false;
            this.disabled = false;

            this.width = "auto";
            this.height = "auto";

            this.scaleBg = false;

            this.backgroundColor = null;
            this.borderWidth = 0;

            this.sizeHolder = 0.0001;
            this.sizePadding = 2;
        },

        init: function() {
            this.id = this.id || "label_" + Core._SN++;

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.initBase();

            this._sizeChanged = true;

            if (this.iconInfo) {
                this.iconHolder = this.addImageHolder(this.iconInfo);
            }

            this.setTextInfo(this.textInfo);

            this.computeTextSize();
            this.computeSelf();
            this.updateAABB();

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
            if (!textInfo) {
                return;
            }

            this.initTextInfo(textInfo);

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
            if (this.textHolder) {
                this.textHolder.setColor(color);
            }
        },

        initTextInfo: function(textInfo) {
            if (!textInfo) {
                return;
            }
            var Me = this;

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
                if (!(p in textInfo) && (p in Me)) {
                    textInfo[p] = Me[p];
                }
            });
        },

        setText: function(text, needToCompute) {
            if (!this.textHolder) {
                return;
            }

            if (this.textInfo) {
                this.textInfo.text = text;
            }
            this.textHolder.setText(text);
            this.textHolder.updateText();
            this._needToComputeSize = this.textHolder.textChanged;
            this._needToCompute = needToCompute !== false;
        },

        computeAutoWidth: function() {
            var pixel = this.pixel;
            var width = this.textHolder ? this.textHolder.areaWidth : this.textWidth;
            width += pixel.paddingLeft + pixel.paddingRight;
            pixel.width = width;
        },

        computeAutoHeight: function() {
            var pixel = this.pixel;
            var height = this.textHolder ? this.textHolder.areaHeight : this.textHeight;
            height += pixel.paddingTop + pixel.paddingBottom;
            pixel.height = height;
        },

        computeWidth: function() {
            var pixel = this.pixel;

            if (this._width === "auto") {
                this.computeAutoWidth();
            } else {
                pixel.width = Utils.parseValue(this.width, pixel.realOuterWidth);
            }
            pixel.width = pixel.width || this.sizeHolder;
            this.absoluteWidth = pixel.width;

            var bg = this.backgroundImageHolder;
            if (bg && this.scaleBg) {
                bg.pixel.width = this._absoluteWidth;
                bg.absoluteWidth = this._absoluteWidth;
            }
        },

        computeHeight: function() {
            var pixel = this.pixel;

            if (this._height === "auto") {
                this.computeAutoHeight();
            } else {
                pixel.height = Utils.parseValue(this.height, pixel.realOuterHeight);
            }
            pixel.height = pixel.height || this.sizeHolder;
            this.absoluteHeight = pixel.height;

            var bg = this.backgroundImageHolder;
            if (bg && this.scaleBg) {
                bg.pixel.height = this._absoluteHeight;
                bg.absoluteHeight = this._absoluteHeight;
            }
        },

        computeTextSize: function(immediately) {
            if (!this.textHolder || !this.textHolder.measure) {
                return;
            }
            var measure = this.textHolder.measure;

            // var ext = this.sizePadding * 2 + this.borderWidth;
            var extX = this.borderWidth + this.paddingLeft + this.paddingRight + this.textHolder.offsetX;
            var extY = this.borderWidth + this.paddingTop + this.paddingBottom + this.textHolder.offsetY;
            this.textWidth = measure.width + extX;
            this.textHeight = measure.height * this.textHolder.lineCount + extY;
        },

        compute: function() {
            this.computeSelf();
            this.updateHolders();
            if (this.textHolder) {
                this.textHolder.update();
            }
            this.updateAABB();
        },

        updateSizeWithText: function() {
            if (this.textHolder) {
                this.textHolder.updateText();
            }
            this.computeTextSize();

            var bg = this.borderImageHolder;
            if (bg && bg.borderImage) {
                bg.cacheCanvas = null;
            }

            this._needToCompute = true;
        },

        update: function(timeStep, now, forceCompute) {
            this.beforeUpdate && this.beforeUpdate(timeStep, now);

            forceCompute = ((this.precomputedTimes--) > 0) || forceCompute;
            this._needToCompute = this._needToCompute || forceCompute;

            var resized = (this._width === "auto" || this._height === "auto") && this._sizeChanged;

            this.updateSelf(timeStep, now);

            if (this._needToComputeSize) {
                this.updateSizeWithText();
                resized = true;
            }

            if (this._needToCompute) {
                this.compute();
            }

            if (resized) {
                this.resizeParents();
            }

            this.afterUpdate && this.afterUpdate(timeStep, now);

            this._needToComputeSize = false;

            this._sizeChanged = false;
            this._positionChanged = false;
            this._needToCompute = false;
            this._needToComputeChildren = false;
        },
    });


    exports.Label = Label;

    if (typeof module !== "undefined") {
        module.exports = Label;
    }

}(CUI));
