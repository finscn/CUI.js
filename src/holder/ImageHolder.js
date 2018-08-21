"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseHolder = exports.BaseHolder;
    var Component = exports.Component;

    var ImageHolder = Class.create({
        superclass: BaseHolder,

        initialize: function() {
            this.parent = null;

            this.src = null;
            this.img = null;
            this.sx = null;
            this.sy = null;
            this.sw = null;
            this.sh = null;

            this.absoluteWidth = null;
            this.absoluteHeight = null;

            this.alpha = 1;
            this.flipX = false;
            this.flipY = false;
            this.rotation = 0;

            this.x = 0;
            this.y = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.offsetW = 0;
            this.offsetH = 0;
            // this.offsetAlpha = 0;

            // auto: 显示大小等于 图片实际大小;
            this.width = "auto";
            this.height = "auto";
            this.fillParent = false;

            this.ratio = null;
            this.lockScaleRatio = true;

            this.crossOrigin = 'anonymous';

            this.tint = null;

            this.config = {};
        },

        init: function() {
            this.id = this.id || "text-holder-" + this.parent.id;

            this.initDisplayObject();

            if (this.src) {
                this.load(this.src);
            } else if (this.img) {
                this.setImg(this.img);
            }

            // this.updateSize();
            // this.updatePosition();
        },

        load: function(callback) {
            this.setSrc(this.src, callback);
        },

        setSrc: function(src, callback) {
            this.src = src;
            var Me = this;
            this.img = null;
            var img = new Image();
            img.crossOrigin = this.crossOrigin;
            img.onload = function(event) {
                Me.setImg(img, callback);
            };
            img.onerror = function(event) {
                Me.setImg(null, callback);
            };
            img.src = src;
            return img;
        },

        setImgInfo: function(info) {
            if (info) {
                for (var p in info) {
                    if (p !== 'src' && p !== 'img') {
                        this[p] = info[p];
                    }
                }
                if (info.src) {
                    this.setSrc(info.src);
                } else if (info.img) {
                    this.setImg(info.img);
                }
            }
        },

        setImg: function(img, callback) {
            this.img = img;
            this.updateImgInfo();
            if (callback) {
                callback(img);
            }
        },

        updateImgInfo: function(info) {
            info = info || this;

            var sx = info.sx;
            var sy = info.sy;
            var sw = info.sw;
            var sh = info.sh;
            var w = info.w;
            var h = info.h;
            var ox = info.ox;
            var oy = info.oy;

            var img = this.img;

            if (sx === null || sx === undefined) {
                sx = 0;
            }
            if (sy === null || sy === undefined) {
                sy = 0;
            }

            if (sw === null || sw === undefined) {
                sw = img ? img.width : 0;
            } else if (img) {
                sw = Math.min(sx + sw, img.width) - sx;
                if (sw <= 0) {
                    sx = img.width;
                    sw = 0;
                }
            }
            if (sh === null || sh === undefined) {
                sh = img ? img.height : 0;
            } else if (img) {
                sh = Math.min(sy + sh, img.height) - sy;
                if (sh <= 0) {
                    sy = img.height;
                    sh = 0;
                }
            }

            if (ox === null || ox === undefined) {
                ox = 0;
            }
            if (oy === null || oy === undefined) {
                oy = 0;
            }
            if (w === null || w === undefined) {
                w = sw;
            }
            if (h === null || h === undefined) {
                h = sh;
            }

            this.config.sx = sx;
            this.config.sy = sy;
            this.config.sw = sw;
            this.config.sh = sh;
            this.config.ox = ox;
            this.config.oy = oy;
            this.config.w = w;
            this.config.h = h;

            this.updateDisplayObject();

            this.pixel.width = w;
            this.pixel.height = h;
            this.absoluteWidth = w;
            this.absoluteHeight = h;

            this.ratio = w / h;
        },

        initDisplayObject: function() {
            var displayObject = this.parent.root.renderer.createSprite();
            this.displayObject = displayObject;
            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

        updateDisplayObject: function() {
            if (!this.img) {
                // this.displayObject = null;
                return;
            }
            var config = this.config;
            this.parent.root.renderer.updateSprite(this.displayObject, config.sx, config.sy, config.sw, config.sh, this.img);
            this.displayObject.tint = this.tint === null ? 0xFFFFFF : this.tint;
        },

        computAutoWidth: function() {
            this.pixel.width = this.config.w;
        },

        computAutoHeight: function() {
            this.pixel.height = this.config.h;
        },

        removeImg: function() {
            this.img = null;
            this.displayObject = null;
            // this.src = null;
        },

    });


    exports.ImageHolder = ImageHolder;

    if (typeof module !== "undefined") {
        module.exports = ImageHolder;
    }

}(CUI));
