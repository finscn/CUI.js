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

            this.crossOrigin = 'anonymous';
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
                this.setBorderImage(this.borderImageInfo);
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
                if (Me.onImageLoad) {
                    Me.onImageLoad(img);
                }
            });
        },
        onImageLoad: null,

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

        getImageInfo: function() {
            if (!this.imageHolder) {
                return null;
            }
            var cfg = this.imageHolder.config;
            return {
                sx: cfg.sx,
                sy: cfg.sy,
                sw: cfg.sw,
                sh: cfg.sh,
                img: this.imageHolder.img
            }
        },

        computeAutoWidth: function() {
            var width = this.imageHolder ? this.imageHolder._displayWidth : 0;
            this.pixel.width = width;
        },

        computeAutoHeight: function() {
            var height = this.imageHolder ? this.imageHolder._displayHeight : 0;
            this.pixel.height = height;
        },

        compute: function() {
            this.computeSelf();

            this.updateHolders();
            if (this.imageHolder) {
                this.imageHolder.update(true);
            }

            this.updateAABB();
        },

        refreshImage: function() {
            var displayObject = this.imageHolder.displayObject;
            if (displayObject) {
                displayObject.updateTexture();
            }
        },

        update: function(timeStep, now, forceCompute) {
            this.beforeUpdate && this.beforeUpdate(timeStep, now);

            forceCompute = ((this.reflowComputeTimes--) > 0) || forceCompute;
            this._needToCompute = this._needToCompute || forceCompute;

            // TODO
            var autoSize = this._width === "auto" || this._height === "auto";
            var resized = autoSize && this._sizeChanged;
            if (this.visible || this._needToCompute || resized) {
                this.updateSelf(timeStep, now);
                resized = autoSize && this._sizeChanged;
            }

            if (this._needToCompute) {
                // console.log("compute of Picture.", this.id);
                this.compute();
            }

            if (resized) {
                this.resizeParents();
            }

            this.afterUpdate && this.afterUpdate(timeStep, now);

            this._sizeChanged = false;
            this._positionChanged = false;
            this._needToCompute = false;
            this._needToComputeChildren = false;

            if (this.visible) {
                this.beforeRender(timeStep, now);
            }
        },
    });

    exports.Picture = Picture;

    if (typeof module !== "undefined") {
        module.exports = Picture;
    }

}(CUI));
