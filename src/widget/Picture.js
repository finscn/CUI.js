"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var ImageHolder = exports.ImageHolder;
    var TextHolder = exports.TextHolder;

    var Picture = Class.create({
        superclass: Component,

        initialize: function() {
            this.composite = false;
            this.disabled = false;

            // 如果不指定宽高 且 scaleImg = false, 大小由 imageHolder 的实际大小决定.

            this.width = null;
            this.height = null;
            this.scaleX = null;
            this.scaleY = null;
            this.scaleImg = true;

            this.crossOrigin = 'Anonymous';
        },

        init: function() {

            Picture.$super.init.call(this);

            this.imageHolder = new ImageHolder({
                parent: this,
                width: this.scaleImg ? "100%" : "auto",
                height: this.scaleImg ? "100%" : "auto",
                alignH: "center",
                alignV: "center",
                crossOrigin: this.crossOrigin,
            });
            this.imageHolder.init();

            if (this.borderInfo) {
                this.setBorderInfo(this.borderInfo);
            }

            if (this.src) {
                this.setSrc(this.src);
            } else if (this.img) {
                this.setImg(this.img);
            } else if (this.imgInfo) {
                this.setImgInfo(this.imgInfo);
            }

            if (this.scaleX !== null) {
                this.width = this.imageHolder.w * this.scaleX;
            }
            if (this.scaleY !== null) {
                this.height = this.imageHolder.h * this.scaleY;
            }

        },

        setSrc: function(src) {
            this.src = src;
            var Me = this;
            this.imageHolder.setSrc(src, function(img) {
                if (img) {
                    Me.setReflow(true);
                }
                Me.hasImg = !!Me.imageHolder.img;
                Me.needToCompute = true;
            });
        },

        setImg: function(img) {
            this.img = img;
            var Me = this;
            this.imageHolder.setImg(img, function(img) {
                if (img) {
                    Me.setReflow(true);
                }
                Me.hasImg = !!Me.imageHolder.img;
                Me.needToCompute = true;
            });
        },

        setImgInfo: function(imgInfo) {
            this.imageHolder.setImgInfo(imgInfo);
            this.hasImg = !!this.imageHolder.img;
            this.needToCompute = true;
        },

        setBorderInfo: function(info) {
            if (!info) {
                this.borderHolder = null;
            } else {
                if (info.borderImage) {
                    this.borderHolder = new CUI.BorderImageHolder(info);
                } else {
                    this.borderHolder = new CUI.BackgroundImageHolder(info);
                }
                this.borderHolder.setParent(this);
                this.borderHolder.fillParent = true;
                this.borderHolder.init();
                this.borderHolder.updateSize();
                this.borderHolder.updatePosition();
            }
            this.needToCompute = true;
        },

        computeWidth: function() {
            var pixel = this.pixel;
            var hasWidth = false;
            if (this.width === null || this.width === "auto") {
                pixel.width = this.imageHolder.w;
            } else {
                hasWidth = true;
                pixel.width = Utils.parseValue(this.width, pixel.realOuterWidth);
            }
            pixel.anchorX = Utils.parseValue(this.anchorX, pixel.width) || 0;
            this.w = pixel.width;

            this.imageHolder.pixel.width = this.w;

            if (!this.hasImg && !hasWidth) {
                this.w = 0.01;
                pixel.width = 0.01;
            }
        },
        computeHeight: function() {
            var pixel = this.pixel;
            var hasHeight = false;
            if (this.height === null || this.height === "auto") {
                pixel.height = this.imageHolder.h;
            } else {
                hasHeight = true;
                pixel.height = Utils.parseValue(this.height, pixel.realOuterHeight);
            }
            pixel.anchorY = Utils.parseValue(this.anchorY, pixel.height) || 0;
            this.h = pixel.height;

            this.imageHolder.pixel.height = this.h;

            if (!this.hasImg && !hasHeight) {
                this.h = 0.01;
                pixel.height = 0.01;
            }
        },

        computeLayout: function(forceCompute) {
            if (!this.needToCompute && !forceCompute) {
                return;
            }

            this.imageHolder.updateSize();
            if (this.scaleImg) {
                this.imageHolder.x = this.x;
                this.imageHolder.y = this.y;
            } else {
                this.imageHolder.updatePosition();
            }

            if (this.borderHolder) {
                this.borderHolder.updateSize();
                this.borderHolder.updatePosition();
            }

            this.needToCompute = false;
        },

        syncPosition: function() {
            this.x = this.pixel.relativeX + this.parent.x;
            this.y = this.pixel.relativeY + this.parent.y;
            this.updateAABB();
            if (this.scaleImg) {
                this.imageHolder.x = this.x;
                this.imageHolder.y = this.y;
            } else {
                this.imageHolder.updatePosition();
            }

            if (this.borderHolder) {
                this.borderHolder.updateSize();
                this.borderHolder.updatePosition();
            }
        },

        renderSelf: function(renderer, timeStep, now) {
            if (this.backgroundColor !== null) {
                renderer.setAlpha(this.backgroundAlpha);
                renderer.fillRect(this.x, this.y, this.w, this.h, this.backgroundColor, this.pixel);
                renderer.restoreAlpha();
            }
            if (this.backgroundHolder) {
                this.backgroundHolder.render(renderer, timeStep, now);
            }

            this.imageHolder && this.imageHolder.render(renderer, timeStep, now);

            this.borderHolder && this.borderHolder.render(renderer, timeStep, now);

            if (this.borderWidth && this.borderColor !== null) {
                renderer.setAlpha(this.borderAlpha);
                renderer.strokeRect(this.x, this.y, this.w, this.h, this.borderColor, this.borderWidth, this.pixel);
                renderer.restoreAlpha();
            }
        },
    });

    exports.Picture = Picture;

    if (typeof module != "undefined") {
        module.exports = Picture;
    }

}(CUI));
