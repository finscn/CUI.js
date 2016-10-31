"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var ImageRenderer = exports.ImageRenderer;
    var TextRenderer = exports.TextRenderer;

    var Picture = Class.create({

        composite: false,
        disabled: false,

        // 不指定宽高, 大小由 bgRenderer 的实际大小决定
        width: null,
        height: null,
        scaleX: null,
        scaleY: null,
        scaleImg: true,

        init: function() {

            Picture.$super.init.call(this);

            this.imageRenderer = new ImageRenderer({
                parent: this,
                width: this.scaleImg ? "100%" : "auto",
                height: this.scaleImg ? "100%" : "auto",
                alignH: "center",
                alignV: "center",
            });
            this.imageRenderer.init();

            if (this.src) {
                this.setSrc(this.src);
            } else if (!this.imgInfo) {
                this.imgInfo = {
                    img: this.img,
                    sx: this.sx,
                    sy: this.sy,
                    sw: this.sw,
                    sh: this.sh,
                    width: this.width,
                    height: this.height,
                };
            }

            this.initBgInfo();

            if (this.img && !this.imgInfo) {
                this.imgInfo = {
                    img: this.img
                };
            }
            if (this.imgInfo) {
                this.setImgInfo(this.imgInfo);
            }

            if (this.scaleX !== null) {
                this.width = this.imageRenderer.w * this.scaleX;
            }
            if (this.scaleY !== null) {
                this.height = this.imageRenderer.h * this.scaleY;
            }

        },

        setSrc: function(src) {
            this.src = src;
            var Me = this;
            this.imageRenderer.setSrc(src, function(img) {
                if (img) {
                    Me.setReflow(true);
                }
                Me.hasImg = !!Me.imageRenderer.img;
            });
        },

        setImgInfo: function(imgInfo) {
            if (!this.imageRenderer) {
                this.imageRenderer = new ImageRenderer(imgInfo);
                this.imageRenderer.setParent(this);
                this.imageRenderer.init();
            } else {
                this.imageRenderer.setImgInfo(imgInfo);
            }
            this.needToCompute = true;
            this.hasImg = !!this.imageRenderer.img;
        },

        computeWidth: function() {
            var pixel = this.pixel;
            var hasWidth = false;
            if (this.width === null || this.width === "auto") {
                pixel.width = this.imageRenderer.w;
            } else {
                hasWidth = true;
                pixel.width = Utils.parseValue(this.width, pixel.realOuterWidth);
            }
            pixel.anchorX = Utils.parseValue(this.anchorX, pixel.width) || 0;
            this.w = pixel.width;

            this.imageRenderer.pixel.width = this.w;

            if (!this.hasImg && !hasWidth) {
                this.w = 0.01;
                pixel.width = 0.01;
            }
        },
        computeHeight: function() {
            var pixel = this.pixel;
            var hasHeight = false;
            if (this.height === null || this.height === "auto") {
                pixel.height = this.imageRenderer.h;
            } else {
                hasHeight = true;
                pixel.height = Utils.parseValue(this.height, pixel.realOuterHeight);
            }
            pixel.anchorY = Utils.parseValue(this.anchorY, pixel.height) || 0;
            this.h = pixel.height;

            this.imageRenderer.pixel.height = this.h;

            if (!this.hasImg && !hasHeight) {
                this.h = 0.01;
                pixel.height = 0.01;
            }
        },

        computeLayout: function(forceCompute) {
            if (this.needToCompute || forceCompute) {
                this.imageRenderer.updateSize();
                if (this.scaleImg) {
                    this.imageRenderer.x = this.x;
                    this.imageRenderer.y = this.y;
                } else {
                    this.imageRenderer.updatePosition();
                }
                this.needToCompute = false;
            }
        },

        syncPosition: function() {
            this.x = this.pixel.relativeX + this.parent.x;
            this.y = this.pixel.relativeY + this.parent.y;
            this.updateAABB();
            if (this.scaleImg) {
                this.imageRenderer.x = this.x;
                this.imageRenderer.y = this.y;
            } else {
                this.imageRenderer.updatePosition();
            }
        },

        renderSelf: function(context, timeStep, now) {

            if (this.backgroundColor) {
                context.fillStyle = this.backgroundColor;
                context.fillRect(this.x, this.y, this.w, this.h);
            }

            this.bgRenderer && this.bgRenderer.render(context);
            this.imageRenderer && this.imageRenderer.render(context);

            if (this.borderColor && this.borderWidth) {
                context.lineWidth = this.borderWidth;
                context.strokeStyle = this.borderColor;
                context.strokeRect(this.x, this.y, this.w, this.h);
            }
        },

    }, Component);


    exports.Picture = Picture;

    if (typeof module != "undefined") {
        module.exports = Picture;
    }

}(CUI));
