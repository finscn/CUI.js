"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseHolder = exports.BaseHolder;
    var Component = exports.Component;

    var ImageHolder = Class.create({

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

        x: 0,
        y: 0,
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
                this.load(this.src);
            } else if (this.img) {
                this.setImg(this.img);
            }
            this.setParent(this.parent);

            this.id = this.id || "image-holder-" + this.parent.id;

        },
        load: function(callback) {
            this.setSrc(this.src, callback);
        },
        setSrc: function(src, callback) {
            this.src = src;
            var Me = this;
            this.img = null;
            var img = new Image();
            img.onload = function(event) {
                Me.setImg(img, callback);
            };
            img.onerror = function(event) {
                Me.setImg(null, callback);
            };
            img.src = src;
            return img;
        },

        setImg: function(img, callback) {
            this.img = img;
            this.updateImgInfo();
            if (callback) {
                callback(img);
            }
        },
        setImgInfo: function(info) {
            for (var p in info) {
                this[p] = info[p];
            }
            if (info.src) {
                this.setSrc(info.src);
            } else if (info.img) {
                this.setImg(info.img);
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

            if (sx === null || sx === undefined) {
                sx = 0;
            }
            if (sy === null || sy === undefined) {
                sy = 0;
            }
            if (sw === null || sw === undefined) {
                sw = this.img ? this.img.width : 0;
            }
            if (sh === null || sh === undefined) {
                sh = this.img ? this.img.height : 0;
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

            this.sx = sx;
            this.sy = sy;
            this.sw = sw;
            this.sh = sh;
            this.w = w;
            this.h = h;
            this.ox = ox;
            this.oy = oy;
        },

        removeImg: function() {
            this.img = null;
            // this.src = null;
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

        simpleRender: function(context, timeStep, now) {
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
            // context.strokeRect(this.x + this.offsetX, this.y + this.offsetY, this.pixel.width + this.offsetW, this.pixel.height + this.offsetH);
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

    }, BaseHolder);


    exports.ImageHolder = ImageHolder;

    if (typeof module != "undefined") {
        module.exports = ImageHolder;
    }

}(CUI));
