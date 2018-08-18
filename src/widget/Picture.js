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

            this.scaleImg = true;

            this.crossOrigin = 'Anonymous';
        },

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            Picture.$super.init.call(this);

            this.imageHolder = new ImageHolder({
                parent: this,
                fillParent: this.scaleImg,
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

        _computeWidth: function() {
            var pixel = this.pixel;
            var relativeWidth = pixel.realOuterWidth;

            var hasWidth = false;

            var fillWidth = this.getFillWidth(relativeWidth);
            if (fillWidth !== null) {
                pixel.width = fillWidth;
            } else {
                if (this.width === null || this.width === "auto") {
                    pixel.width = this.imageHolder.absoluteWidth;
                } else {
                    hasWidth = true;
                    pixel.width = Utils.parseValue(this.width, relativeWidth);
                }
            }

            pixel.width *= this.scaleX;
            pixel.anchorX = Utils.parseValue(this.anchorX, pixel.width) || 0;
            this.absoluteWidth = pixel.width;


            this.imageHolder.pixel.width = this.absoluteWidth;

            // TODO
            if (!this.hasImg && !hasWidth) {
                this.absoluteWidth = 0.01;
                pixel.width = 0.01;
            }
        },

        _computeHeight: function() {
            var pixel = this.pixel;
            var relativeHeight = pixel.realOuterHeight;

            var hasHeight = false;

            var fillHeight = this.getFillHeight(relativeHeight);
            if (fillHeight !== null) {
                pixel.height = fillHeight;
            } else {
                if (this.height === null || this.height === "auto") {
                    pixel.height = this.imageHolder.absoluteHeight;
                } else {
                    hasHeight = true;
                    pixel.height = Utils.parseValue(this.height, relativeHeight);
                }
            }

            pixel.height *= this.scaleY;
            pixel.anchorY = Utils.parseValue(this.anchorY, pixel.height) || 0;
            this.absoluteHeight = pixel.height;


            this.imageHolder.pixel.height = this.absoluteHeight;

            // TODO
            if (!this.hasImg && !hasHeight) {
                this.absoluteHeight = 0.01;
                pixel.height = 0.01;
            }
        },

        computeLayout: function(forceCompute) {
            if (!this._needToCompute && !forceCompute) {
                return;
            }

            this.computeSelf(this.parent);
            this.updateHolders();

            this._needToCompute = false;
        },

        updateHolders: function() {
            this.imageHolder.pixel.width = this.absoluteWidth;
            this.imageHolder.absoluteWidth = this.absoluteWidth;
            this.imageHolder.pixel.height = this.absoluteHeight;
            this.imageHolder.absoluteHeight = this.absoluteHeight;
            // this.imageHolder.updateSize();
            this.imageHolder.updatePosition();
            this.imageHolder.update();


            if (this.imageBorderHolder) {
                this.imageBorderHolder.updateSize();
                this.imageBorderHolder.updatePosition();
                this.imageBorderHolder.update();
            }

            if (this.borderHolder) {
                this.borderHolder.updateSize();
                this.borderHolder.updatePosition();
                this.borderHolder.update();
            }
        },
    });

    exports.Picture = Picture;

    if (typeof module !== "undefined") {
        module.exports = Picture;
    }

}(CUI));
