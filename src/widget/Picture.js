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

        init: function() {

            Picture.$super.init.call(this);

            this.imageRenderer = new ImageRenderer({
                parent: this
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
                this.imageRenderer.setImgInfo(this.imgInfo);
            }
        },

        setSrc: function(src) {
            this.src = src;
            var Me = this;
            this.imageRenderer.setSrc(src, function(img) {
                if (img) {
                    Me.setReflow(true);
                }
            });
        },

        computeWidth: function() {
            var pixel = this.pixel;
            if (this.width === null || this.width === "auto") {
                pixel.width = this.imageRenderer.sw;
            } else {
                pixel.width = Utils.parseValue(this.width, pixel.realOuterWidth);
            }
            pixel.anchorX = Utils.parseValue(this.anchorX, pixel.width) || 0;
            this.w = pixel.width;

            this.imageRenderer.pixel.width = this.w;
        },
        computeHeight: function() {
            var pixel = this.pixel;
            if (this.height === null || this.height === "auto") {
                pixel.height = this.imageRenderer.sh;
            } else {
                pixel.height = Utils.parseValue(this.height, pixel.realOuterHeight);
            }
            pixel.anchorY = Utils.parseValue(this.anchorY, pixel.height) || 0;
            this.h = pixel.height;

            this.imageRenderer.pixel.height = this.h;
        },

        computeLayout: function(forceCompute) {
            if (this.needToCompute || forceCompute) {
                this.imageRenderer.x = this.x;
                this.imageRenderer.y = this.y;
                this.needToCompute = false;
            }
        },

        syncPosition: function() {
            this.x = this.pixel.relativeX + this.parent.x;
            this.y = this.pixel.relativeY + this.parent.y;
            this.updateAABB();
            this.imageRenderer.x = this.x;
            this.imageRenderer.y = this.y;
        },

        renderSelf: function(context, timeStep, now) {

            if (this.backgroundColor) {
                context.fillStyle = this.backgroundColor;
                context.fillRect(this.x, this.y, this.w, this.h);
            }
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
