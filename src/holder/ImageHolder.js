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

            this.ox = null;
            this.oy = null;
            this.w = null;
            this.h = null;

            this.alpha = null;
            this.scale = 1;
            this.scaleX = null;
            this.scaleY = null;
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
            this.ox = ox;
            this.oy = oy;
            this.w = w;
            this.h = h;

            this.initDisplayObject();
        },

        initDisplayObject: function() {
            if (!this.img) {
                this.displayObject = null;
                return;
            }
            // var renderer = CUI.renderer;
            var renderer = this.parent.getRenderer();
            var pixel = this.pixel;
            this.displayObject = renderer.createDisplayObject(this.img, pixel.sx, pixel.sy, pixel.sw, pixel.sh, true);
            this.displayObject.tint = this.tint === null ? 0xFFFFFF : this.tint;
        },

        setTint: function(tint) {
            this.tint = tint;
            if (this.displayObject) {
                this.displayObject.tint = this.tint === null ? 0xFFFFFF : this.tint;
            }
        },

        removeImg: function() {
            this.img = null;
            this.displayObject = null;
            // this.src = null;
        },

        updateSize: function() {
            // always updateSize ???

            if (this.parent && this.fillParent) {
                this.pixel.width = Utils.parseValue(this.width, this.parent.pixel.width, this.w) || 0;
            } else {
                this.pixel.width = Utils.parseValue(this.width, this.w, this.w) || 0
            }
            this.pixel.width = this.pixel.width * this.scaleX;
            this.pixel.ox = this.ox;

            if (this.parent && this.fillParent) {
                this.pixel.height = Utils.parseValue(this.height, this.parent.pixel.height, this.h) || 0;
            } else {
                this.pixel.height = Utils.parseValue(this.height, this.h, this.h) || 0
            }
            this.pixel.height = this.pixel.height * this.scaleY;
            this.pixel.oy = this.oy;
        },

        setScale: function(scale) {
            this.scale = scale;
            this.scaleX = scale;
            this.scaleY = scale;
        },

        simpleRender: function(renderer, timeStep, now) {
            if (!this.visible || !this.img) {
                return false;
            }
            var x = this.x - this.anchorX + this.offsetX + this.ox;
            var y = this.y - this.anchorY + this.offsetY + this.oy;
            var w = this.pixel.width + this.offsetW;
            var h = this.pixel.height + this.offsetH;
            renderer.drawDisplayObject(this.displayObject, x, y, w, h);
        },

        render: function(renderer, timeStep, now) {
            if (!this.visible || !this.img) {
                return false;
            }
            // var alpha = this.alpha + this.offsetAlpha;
            // if (alpha <= 0) {
            //     return false;
            // }
            var x = -this.anchorX;
            var y = -this.anchorY;
            var width = this.pixel.width;
            var height = this.pixel.height;

            var flipX = this.flipX ? -1 : 1;
            var flipY = this.flipY ? -1 : 1;
            // var scaleX = this.scaleX * (this.flipX ? -1 : 1);
            // var scaleY = this.scaleY * (this.flipY ? -1 : 1);

            var rotation = this.rotation % this.DOUBLE_PI;

            if (flipX !== 1 || flipY !== 1 || rotation !== 0) {
                // if (scaleX !== 1 || scaleY !== 1 || rotation !== 0) {

                // TODO
                renderer.save();
                renderer.translate(this.x + this.offsetX + this.pixel.ox, this.y + this.offsetY + this.pixel.oy);
                if (rotation) {
                    renderer.rotate(rotation);
                }
                renderer.scale(flipX, flipY);
                // renderer.scale(scaleX, scaleY);
            } else {
                x += this.x + this.offsetX + this.pixel.ox;
                y += this.y + this.offsetY + this.pixel.oy;
            }

            if (this.alpha !== null) {
                renderer.setAlpha(this.alpha);
            }

            renderer.drawDisplayObject(this.displayObject, x, y, width + this.offsetW, height + this.offsetH);

            if (flipX !== 1 || flipY !== 1 || rotation !== 0) {
                // if (scaleX !== 1 || scaleY !== 1 || rotation !== 0) {
                renderer.restore();
            } else {
                if (this.alpha !== null) {
                    renderer.restoreAlpha();
                }
            }
        },

    });


    exports.ImageHolder = ImageHolder;

    if (typeof module !== "undefined") {
        module.exports = ImageHolder;
    }

}(CUI));
