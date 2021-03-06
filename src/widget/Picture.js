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
            this.scaleX = 1;
            this.scaleY = 1;
            this.scaleImg = true;

            this.crossOrigin = 'Anonymous';
            this.tint = null;
        },

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            Picture.$super.init.call(this);

            this.imageHolder = new ImageHolder({
                parent: this,
                width: this.scaleImg ? "100%" : "auto",
                height: this.scaleImg ? "100%" : "auto",
                alignH: "center",
                alignV: "center",
                crossOrigin: this.crossOrigin,
                tint: this.tint,
            });
            this.imageHolder.init();

            if (this.imageBorderInfo) {
                this.setImageBorderInfo(this.imageBorderInfo);
            }

            if (this.src) {
                this.setSrc(this.src);
            } else if (this.img) {
                this.setImg(this.img);
            } else if (this.imgInfo) {
                this.setImgInfo(this.imgInfo);
            }

            if (this.afterInit) {
                this.afterInit();
            }
        },

        setTint: function(tint) {
            this.tint = tint;
            this.imageHolder.tint = tint;
        },

        getTint: function(tint) {
            return this.tint;
        },

        setSrc: function(src) {
            this.src = src;
            var Me = this;
            this.imageHolder.setSrc(src, function(img) {
                if (img) {
                    Me.setReflow(true);
                }
                Me.hasImg = !!Me.imageHolder.img;
                Me._needToCompute = true;
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
                Me._needToCompute = true;
            });
        },

        setImgInfo: function(imgInfo) {
            this.imageHolder.setImgInfo(imgInfo);
            this.imageHolder.tint = this.tint;
            this.hasImg = !!this.imageHolder.img;
            this._needToCompute = true;
        },

        setImageBorderInfo: function(info) {
            if (!info) {
                this.imageBorderHolder = null;
            } else {
                if (info.borderImage) {
                    this.imageBorderHolder = new CUI.BorderImageHolder(info);
                } else {
                    this.imageBorderHolder = new CUI.BackgroundHolder(info);
                }
                this.imageBorderHolder.setParent(this);
                this.imageBorderHolder.fillParent = true;
                this.imageBorderHolder.init();
                this.imageBorderHolder.updateSize();
                this.imageBorderHolder.updatePosition();
            }
            this._needToCompute = true;
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
            pixel.width *= this.scaleX;
            this.w = pixel.width;

            pixel.anchorX = Utils.parseValue(this.anchorX, this.w) || 0;

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
            pixel.height *= this.scaleY;
            this.h = pixel.height;

            pixel.anchorY = Utils.parseValue(this.anchorY, this.h) || 0;

            this.imageHolder.pixel.height = this.h;

            if (!this.hasImg && !hasHeight) {
                this.h = 0.01;
                pixel.height = 0.01;
            }
        },

        computeLayout: function(forceCompute) {
            if (!this._needToCompute && !forceCompute) {
                return;
            }

            this.imageHolder.updateSize();
            if (this.scaleImg) {
                this.imageHolder.x = this.x;
                this.imageHolder.y = this.y;
            } else {
                this.imageHolder.updatePosition();
            }

            if (this.imageBorderHolder) {
                this.imageBorderHolder.updateSize();
                this.imageBorderHolder.updatePosition();
            }

            if (this.borderHolder) {
                this.borderHolder.updateSize();
                this.borderHolder.updatePosition();
            }

            this._needToCompute = false;
        },

        syncHolders: function() {
            if (this.scaleImg) {
                this.imageHolder.x = this.x;
                this.imageHolder.y = this.y;
            } else {
                this.imageHolder.updateSize();
                this.imageHolder.updatePosition();
            }

            if (this.imageBorderHolder) {
                this.imageBorderHolder.updateSize();
                this.imageBorderHolder.updatePosition();
            }

            if (this.borderHolder) {
                this.borderHolder.updateSize();
                this.borderHolder.updatePosition();
            }
        },

        renderSelf: function(renderer, timeStep, now) {
            this.backgroundHolder && this.backgroundHolder.render(renderer, timeStep, now);
            this.borderHolder && this.borderHolder.render(renderer, timeStep, now);
            this.imageHolder && this.imageHolder.render(renderer, timeStep, now);
            this.imageBorderHolder && this.imageBorderHolder.render(renderer, timeStep, now);
        },
    });

    exports.Picture = Picture;

    if (typeof module !== "undefined") {
        module.exports = Picture;
    }

}(CUI));
