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

            this.ox = 0;
            this.oy = 0;
            this.absoluteWidth = null;
            this.absoluteHeight = null;

            this.alpha = 1;
            this.scale = 1;
            this.scaleX = 1;
            this.scaleY = 1;
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
            this.fillParent = true;

            this.crossOrigin = 'anonymous';

            this.tint = null;
        },

        init: function() {
            if (this.scaleX === null) {
                this.scaleX = this.scale;
            }
            if (this.scaleY === null) {
                this.scaleY = this.scale;
            }

            this.setParent(this.parent);

            this.initDisplayObject();

            if (this.src) {
                this.load(this.src);
            } else if (this.img) {
                this.setImg(this.img);
            }

            this.id = this.id || "image-holder-" + this.parent.id;

            this.updateSize();
            this.updatePosition();
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

            this.pixel.sx = sx;
            this.pixel.sy = sy;
            this.pixel.sw = sw;
            this.pixel.sh = sh;
            this.pixel.ox = ox;
            this.pixel.oy = oy;
            this.pixel.width = w;
            this.pixel.height = h;

            this.updateDisplayObject();

            this.ox = ox;
            this.oy = oy;
            this.absoluteWidth = w;
            this.absoluteHeight = h;
        },

        updateDisplayObject: function() {
            if (!this.img) {
                // this.displayObject = null;
                return;
            }
            var pixel = this.pixel;
            CUI.Utils.updateDisplayObject(this.displayObject, this.img, pixel.sx, pixel.sy, pixel.sw, pixel.sh);
            this.displayObject.tint = this.tint === null ? 0xFFFFFF : this.tint;
        },

        removeImg: function() {
            this.img = null;
            this.displayObject = null;
            // this.src = null;
        },

        updateSize: function() {
            // always updateSize ???
            if (this.parent && this.fillParent) {
                this.pixel.width = Utils.parseValue(this.width, this.parent._absoluteWidth, this.pixel.width) || 0;
            } else {
                this.pixel.width = Utils.parseValue(this.width, this.pixel.width, this.pixel.width) || 0
            }
            this.pixel.width = this.pixel.width * this.scaleX;
            this.pixel.ox = this.ox;
            this.absoluteWidth = this.pixel.width;

            if (this.parent && this.fillParent) {
                this.pixel.height = Utils.parseValue(this.height, this.parent._absoluteHeight, this.pixel.height) || 0;
            } else {
                this.pixel.height = Utils.parseValue(this.height, this.pixel.height, this.pixel.height) || 0
            }
            this.pixel.height = this.pixel.height * this.scaleY;
            this.pixel.oy = this.oy;
            this.absoluteHeight = this.pixel.height;
        },

        setScale: function(scale) {
            this.scale = scale;
            this.scaleX = scale;
            this.scaleY = scale;
        },
    });


    exports.ImageHolder = ImageHolder;

    if (typeof module !== "undefined") {
        module.exports = ImageHolder;
    }

}(CUI));
