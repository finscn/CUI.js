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
            this.textHolder.updateText();
            this._needToComputeSize = this.textHolder.textChanged;
            this._needToCompute = needToCompute !== false;
        },

        computeAutoWidth: function() {
            var width = this.textHolder ? this.textHolder.cacheWidth : this.textWidth;
            this.pixel.width = width;
        },

        computeAutoHeight: function() {
            var height = this.textHolder ? this.textHolder.cacheHeight : this.textHeight;
            this.pixel.height = height;
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
            // this._needToCompute = false;

            if (this.textHolder) {
                this.textHolder.update();
            }

            this.updateHolders();
        },


        updateSizeWithText: function() {
            // if (this.textHolder._needToCompute) {

            this.textHolder.updateText();
            // }
            this.computeTextSize();

            var bg = this.backgroundImageHolder;
            if (bg && bg.borderImage) {
                bg.cacheCanvas = null;
            }

            // this.tryToReflow(this.reflow);
            // if (this._width === "auto" || this._height === "auto") {
            //     // this.tryToReflow(this.reflow, true);
            //     this.tryToReflow(this.reflow);
            // } else {
            //     this.computeSelf();
            //     this.computeLayout(true);
            // }
            this.computeSelf();
            this.computeLayout(true);
        },

        update: function(timeStep, now) {
            this.beforeUpdate && this.beforeUpdate(timeStep, now);

            var resized = (this._width === "auto" || this._height === "auto") && this._sizeChanged;

            this.updateSelf(timeStep, now);

            if (this._needToComputeSize) {
                this.updateSizeWithText();
                resized = true;
            } else if (this._needToCompute) {
                this.computeSelf();
                this.computeLayout();
            }

            if (resized){
                this.resizeParents();
            }

            this.afterUpdate && this.afterUpdate(timeStep, now);

            this._sizeChanged = false;
            this._positionChanged = false;
            this._needToCompute = false;

            this._needToComputeSize = false;
        },
    });


    exports.Label = Label;

    if (typeof module !== "undefined") {
        module.exports = Label;
    }

}(CUI));
