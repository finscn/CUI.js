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

        computeSelf: function(parent) {
            parent = parent || this.parent;

            this.computeMargin(parent);
            this.computeRealMargin(parent);

            if (this.width === "auto" && this.imageHolder) {
                this.pixel.width = this.imageHolder.absoluteWidth;
                this.absoluteWidth = this.pixel.width;
            } else {
                this.computeWidth();
            }
            if (this.height === "auto" && this.imageHolder) {
                this.pixel.height = this.imageHolder.absoluteHeight;
                this.absoluteHeight = this.pixel.height;
            } else {
                this.computeHeight();
            }

            this.computePositionX(parent);
            this.computePositionY(parent);
            this.computePadding();
            this.updateAABB();
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
