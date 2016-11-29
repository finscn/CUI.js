"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var ImageHolder = exports.ImageHolder;
    var TextHolder = exports.TextHolder;

    var Picture = Class.create({

        composite: false,
        disabled: false,

        // 不指定宽高, 大小由 backgroundHolder 的实际大小决定
        width: null,
        height: null,
        scaleX: null,
        scaleY: null,
        scaleImg: true,

        init: function() {

            Picture.$super.init.call(this);

            this.imageHolder = new ImageHolder({
                parent: this,
                width: this.scaleImg ? "100%" : "auto",
                height: this.scaleImg ? "100%" : "auto",
                alignH: "center",
                alignV: "center",
            });
            this.imageHolder.init();

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
            if (this.needToCompute || forceCompute) {
                this.imageHolder.updateSize();
                if (this.scaleImg) {
                    this.imageHolder.x = this.x;
                    this.imageHolder.y = this.y;
                } else {
                    this.imageHolder.updatePosition();
                }
                this.needToCompute = false;
            }
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
        },

        renderSelf: function(renderer, timeStep, now) {
            if (this.backgroundColor) {
                // context.fillStyle = this.backgroundColor;
                renderer.fillRect(this.x, this.y, this.w, this.h, this.backgroundColor, this.pixel);
            }
            if (this.backgroundHolder) {
                this.backgroundHolder.render(renderer, timeStep, now);
            }

            this.imageHolder && this.imageHolder.render(renderer, timeStep, now);

            if (this.borderColor && this.borderWidth) {
                // context.strokeStyle = this.borderColor;
                // context.lineWidth = this.borderWidth;
                renderer.strokeRect(this.x, this.y, this.w, this.h, this.borderColor, this.borderWidth, this.pixel);
            }
        },

    }, Component);


    exports.Picture = Picture;

    if (typeof module != "undefined") {
        module.exports = Picture;
    }

}(CUI));
