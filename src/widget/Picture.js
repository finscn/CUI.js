"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Component = exports.Component;
    var ImageHolder = exports.ImageHolder;
    var TextHolder = exports.TextHolder;

    var Picture = Class.create({
        superclass: Component,

        initialize: function() {
            this.composite = false;
            this.disabled = false;

            this.width = "auto";
            this.height = "auto";

            // 如果不指定宽高 且 scaleImg = false, 大小由 imageHolder 的实际大小决定.
            // TODO: 多种方式缩放
            this.scaleImg = true;
            this.lockScaleRatio = true;

            this.crossOrigin = 'Anonymous';
        },

        init: function() {
            this.id = this.id || "picture_" + Core._SN++;

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.initBase();

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
                this.setImageInfo(this.imgInfo);
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
            var autoResize = this.width === "auto" || this.height === "auto";
            this.imageHolder.setSrc(src, function(img) {
                if (img) {
                    if (autoResize) {
                        Me.tryToReflow(Me.reflow);
                    } else {
                        Me.computeSelf();
                        Me.computeLayout(true);
                    }
                }
                Me.hasImg = !!Me.imageHolder.img;
                Me._needToCompute = true;
            });
        },

        setImg: function(img) {
            this.img = img;
            var Me = this;
            var autoResize = this.width === "auto" || this.height === "auto";
            this.imageHolder.setImg(img, function(img) {
                if (img) {
                    if (autoResize) {
                        Me.tryToReflow(Me.reflow);
                    } else {
                        Me.computeSelf();
                        Me.computeLayout(true);
                    }
                }
                Me.hasImg = !!Me.imageHolder.img;
                Me._needToCompute = true;
            });
        },

        setImageInfo: function(imgInfo) {
            this.imageHolder.setImageInfo(imgInfo);
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
            this._needToCompute = false;

            this.computeSelf();

            this.updateHolders();

            if (this.imageHolder) {
                this.imageHolder.updateSize();
                this.imageHolder.updatePosition();
                this.imageHolder.update();
            }
        },
    });

    exports.Picture = Picture;

    if (typeof module !== "undefined") {
        module.exports = Picture;
    }

}(CUI));
