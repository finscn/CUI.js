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
            // TODO: 多种方式缩放
            this.scaleImg = true;
            this.lockScaleRatio = true;

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
                lockScaleRatio: this.lockScaleRatio,
                width: this.scaleImg ? "100%" : "auto",
                height: this.scaleImg ? "100%" : "auto",
                alignH: "center",
                alignV: "center",
                crossOrigin: this.crossOrigin,
                tint: this.tint,
            });
            this.imageHolder.init();

            if (this.borderImageInfo) {
                this.setBorderImageInfo(this.borderImageInfo);
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

        computAutoWidth: function() {
            var width = this.imageHolder ? this.imageHolder._absoluteWidth : 0;
            this.pixel.width = width;
            this.absoluteWidth = width;
        },

        computAutoHeight: function() {
            var height = this.imageHolder ? this.imageHolder._absoluteHeight : 0;
            this.pixel.height = height;
            this.absoluteHeight = height;
        },

        computeLayout: function(forceCompute) {
            if (!this._needToCompute && !forceCompute) {
                return;
            }

            this.computeSelf();
            this.updateHolders();

            this._needToCompute = false;
        },

        updateHolders: function() {
            // TODO
            // this.imageHolder.pixel.width = this._absoluteWidth;
            // this.imageHolder.absoluteWidth = this._absoluteWidth;
            // this.imageHolder.pixel.height = this._absoluteHeight;
            // this.imageHolder.absoluteHeight = this._absoluteHeight;
            this.imageHolder.updateSize();
            this.imageHolder.updatePosition();
            this.imageHolder.update();


            if (this.borderImageHolder) {
                this.borderImageHolder.updateSize();
                this.borderImageHolder.updatePosition();
                this.borderImageHolder.update();
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
