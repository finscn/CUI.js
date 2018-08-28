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

            this.imgWidth = "auto";
            this.imgHeight = "auto";

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
                width: this.imgWidth || "auto",
                height: this.imgHeight || "auto",
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
            var flexible = this._width === "auto" || this._height === "auto";
            this.imageHolder.setSrc(src, function(img) {
                if (img) {
                    Me._sizeChanged = true;
                }
                Me.hasImg = !!Me.imageHolder.img;
                Me._needToCompute = true;
            });
        },

        setImg: function(img) {
            this.img = img;
            var Me = this;
            var flexible = this._width === "auto" || this._height === "auto";
            this.imageHolder.setImg(img, function(img) {
                if (img) {
                    Me._sizeChanged = true;
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

        computeAutoWidth: function() {
            var width = this.imageHolder ? this.imageHolder._displayWidth : 0;
            this.pixel.width = width;
        },

        computeAutoHeight: function() {
            var height = this.imageHolder ? this.imageHolder._displayHeight : 0;
            this.pixel.height = height;
        },

        computeLayout: function(forceCompute) {
            if (!this._needToCompute && !forceCompute) {
                return;
            }
            // this._needToCompute = false;


            this.updateHolders();

            if (this.imageHolder) {
                this.imageHolder.update();
            }
        },

        update: function(timeStep, now) {
            this.beforeUpdate && this.beforeUpdate(timeStep, now);

            var resized = (this._width === "auto" || this._height === "auto") && this._sizeChanged;

            this.updateSelf(timeStep, now);

            if (this._needToCompute) {
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

            this._sizeChanged = false;
        },
    });

    exports.Picture = Picture;

    if (typeof module !== "undefined") {
        module.exports = Picture;
    }

}(CUI));
