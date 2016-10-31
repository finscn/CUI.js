"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseRenderer = exports.BaseRenderer;

    var ImageRenderer = Class.create({

        DEG_TO_RAD: Math.PI / 180,
        RAD_TO_DEG: 180 / Math.PI,
        HALF_PI: Math.PI / 2,
        DOUBLE_PI: Math.PI * 2,

        src: null,
        img: null,
        sx: null,
        sy: null,
        sw: null,
        sh: null,
        ox: null,
        oy: null,
        w: null,
        h: null,

        alpha: null,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        flipX: false,
        flipY: false,
        rotation: 0,

        offsetX: 0,
        offsetY: 0,
        offsetW: 0,
        offsetH: 0,
        // offsetAlpha: 0,

        // auto : 显示大小等于 图片实际大小.
        width: "auto",
        height: "auto",

        init: function() {
            this.pixel = {};
            if (this.src) {
                this.setSrc(this.src);
            } else {
                this.setImgInfo(this);
            }
            this.setParent(this.parent);
        },

        setSrc: function(src, callback) {
            this.src = src;
            var Me = this;
            this.sx = 0;
            this.sy = 0;
            this.sw = 0;
            this.sh = 0;
            this.ox = 0;
            this.oy = 0;
            this.w = 0;
            this.h = 0;

            var img = new Image();
            img.onload = function(event) {
                var info = Utils.getImageInfo(img);
                Me.setImgInfo(info);
                if (callback) {
                    callback(img);
                }
            };
            img.onerror = function(event) {
                Me.img = null;
                if (callback) {
                    callback(null);
                }
            };
            img.src = src;
            return img;
        },
        removeImg: function() {
            this.info = null;
            this.img = null;
            this.sx = 0;
            this.sy = 0;
            this.sw = 0;
            this.sh = 0;
            this.w = 0;
            this.h = 0;
            this.ox = 0;
            this.oy = 0;
        },

        setImgInfo: function(info) {
            if (!info) {
                this.removeImg();
                return;
            }
            this.info = {};
            this.img = this.info.img = info.img;
            var sx = this.info.sx = info.sx;
            var sy = this.info.sy = info.sy;
            var sw = this.info.sw = info.sw;
            var sh = this.info.sh = info.sh;
            var w = this.info.w = info.w;
            var h = this.info.h = info.h;
            var ox = this.info.ox = info.ox;
            var oy = this.info.oy = info.oy;

            if (sx === null || sx === undefined) {
                sx = 0;
            }
            if (sy === null || sy === undefined) {
                sy = 0;
            }
            if (ox === null || ox === undefined) {
                ox = 0;
            }
            if (oy === null || oy === undefined) {
                oy = 0;
            }
            if (this.img) {
                if (sw === null || sw === undefined) {
                    sw = this.img.width;
                }
                if (sh === null || sh === undefined) {
                    sh = this.img.height;
                }
            } else {
                sw = sh = 0;
            }

            if (w === null || w === undefined) {
                w = sw;
            }
            if (h === null || h === undefined) {
                h = sh;
            }

            this.sx = sx;
            this.sy = sy;
            this.sw = sw;
            this.sh = sh;
            this.w = w;
            this.h = h;
            this.ox = ox;
            this.oy = oy;

            // if (this.width === "auto") {
            //     this.pixel.width = this.sw;
            // }
            // if (this.height === "auto") {
            //     this.pixel.height = this.sh;
            // }

        },

        updateSize: function() {
            if (this.parent) {
                this.pixel.width = Utils.parseValue(this.width, this.parent.pixel.width, this.w) || 0;
            } else {
                this.pixel.width = Utils.parseValue(this.width, this.w, this.w) || 0
            }
            this.pixel.width = this.pixel.width * this.scaleX;
            this.pixel.sw = this.sw * this.pixel.width / this.w;
            this.pixel.ox = this.ox * this.pixel.width / this.w;

            if (this.parent) {
                this.pixel.height = Utils.parseValue(this.height, this.parent.pixel.height, this.h) || 0;
            } else {
                this.pixel.height = Utils.parseValue(this.height, this.h, this.h) || 0
            }
            this.pixel.height = this.pixel.height * this.scaleY;
            this.pixel.sh = this.sh * this.pixel.height / this.h;
            this.pixel.oy = this.oy * this.pixel.height / this.h;

        },

        setScale: function(scale) {
            this.scale = scale;
            this.scaleX = scale;
            this.scaleY = scale;
        },

        quickRender: function(context, timeStep, now) {
            if (!this.visible || !this.img) {
                return false;
            }
            var x = this.x - this.anchorX + this.offsetX + this.ox;
            var y = this.y - this.anchorY + this.offsetY + this.oy;
            var w = this.pixel.sw + this.offsetW;
            var h = this.pixel.sh + this.offsetH;
            context.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, x, y, w, h);
        },

        render: function(context, timeStep, now) {
            if (!this.visible || !this.img) {
                return false;
            }
            // var alpha = this.alpha + this.offsetAlpha;
            // if (alpha <= 0) {
            //     return false;
            // }
            var x = -this.anchorX;
            var y = -this.anchorY;
            var width = this.pixel.sw;
            var height = this.pixel.sh;

            var flipX = this.flipX ? -1 : 1;
            var flipY = this.flipY ? -1 : 1;
            // var scaleX = this.scaleX * (this.flipX ? -1 : 1);
            // var scaleY = this.scaleY * (this.flipY ? -1 : 1);

            var rotation = this.rotation % this.DOUBLE_PI;

            if (flipX != 1 || flipY != 1 || rotation != 0) {
                // if (scaleX != 1 || scaleY != 1 || rotation != 0) {
                context.save();
                context.translate(this.x + this.offsetX + this.pixel.ox, this.y + this.offsetY + this.pixel.oy);
                if (rotation) {
                    context.rotate(rotation);
                }
                context.scale(flipX, flipY);
                // context.scale(scaleX, scaleY);
            } else {
                x += this.x + this.offsetX + this.pixel.ox;
                y += this.y + this.offsetY + this.pixel.oy;
            }

            // context.lineWidth = 2;
            // context.strokeRect(this.x + this.offsetX, this.y + this.offsetY, this.pixel.width + this.offsetW, this.pixel.height + this.offsetH)
            // context.strokeRect(x, y, width + this.offsetW, height + this.offsetH);

            var prevAlpha;
            if (this.alpha !== null) {
                prevAlpha = context.globalAlpha;
                context.globalAlpha = this.alpha;
            }

            context.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, x, y, width + this.offsetW, height + this.offsetH);

            if (flipX != 1 || flipY != 1 || rotation != 0) {
                // if (scaleX != 1 || scaleY != 1 || rotation != 0) {
                context.restore();
            } else {
                if (this.alpha !== null) {
                    context.globalAlpha = prevAlpha;
                }
            }
        },

    }, BaseRenderer);


    exports.ImageRenderer = ImageRenderer;

    if (typeof module != "undefined") {
        module.exports = ImageRenderer;
    }

}(CUI));
