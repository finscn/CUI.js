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

        img: null,
        sx: null,
        sy: null,
        sw: null,
        sh: null,

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
        offsetAlpha: 0,

        // auto : 显示大小等于 图片实际大小.
        width: "auto",
        height: "auto",

        init: function() {
            this.pixel = {};
            this.setImgInfo(this);
            this.setParent(this.parent);
        },

        setImgInfo: function(info) {
            this.img = info.img;
            var sx = info.sx;
            var sy = info.sy;
            var sw = info.sw;
            var sh = info.sh;

            if (sx === null || sx === undefined) {
                sx = 0;
            }
            if (sy === null || sy === undefined) {
                sy = 0;
            }
            if (sw === null || sw === undefined) {
                sw = this.img.width;
            }
            if (sh === null || sh === undefined) {
                sh = this.img.height;
            }
            this.sx = sx;
            this.sy = sy;
            this.sw = sw;
            this.sh = sh;

            if (this.width === "auto") {
                this.pixel.width = this.sw;
            }
            if (this.height === "auto") {
                this.pixel.height = this.sh;
            }

        },

        updateSize: function() {
            if (this.parent) {
                if (this.width !== "auto") {
                    this.pixel.width = Utils.parseValue(this.width, this.parent.pixel.width) || 0;
                }
                if (this.height !== "auto") {
                    this.pixel.height = Utils.parseValue(this.height, this.parent.pixel.height) || 0;
                }
            }
        },

        setScale: function(scale) {
            this.scale = scale;
            this.scaleX = scale;
            this.scaleY = scale;
        },

        quickRender: function(context, timeStep, now) {
            var x = this.x - this.anchorX + this.offsetX;
            var y = this.y - this.anchorY + this.offsetY;
            var w = this.pixel.width + this.offsetW;
            var h = this.pixel.height + this.offsetH;
            context.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, x, y, w, h);
        },

        render: function(context, timeStep, now) {

            var alpha = this.alpha + this.offsetAlpha;
            if (alpha <= 0) {
                return false;
            }

            var x = -this.anchorX;
            var y = -this.anchorY;
            var width = this.pixel.width;
            var height = this.pixel.height;

            var scaleX = this.scaleX * (this.flipX ? -1 : 1);
            var scaleY = this.scaleY * (this.flipY ? -1 : 1);
            var rotation = this.rotation % this.DOUBLE_PI;

            if (scaleX != 1 || scaleY != 1 || rotation != 0) {
                context.save();
                context.translate(this.x + this.offsetX, this.y + this.offsetY);
                if (rotation) {
                    context.rotate(rotation);
                }
                context.scale(scaleX, scaleY);
            } else {
                x += this.x + this.offsetX;
                y += this.y + this.offsetY;
            }
            context.globalAlpha = alpha > 1 ? 1 : alpha;
            context.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, x, y, width + this.offsetW, height + this.offsetH);

            if (scaleX != 1 || scaleY != 1 || rotation != 0) {
                context.restore();
            } else {
                context.globalAlpha = 1;
            }
        },

    }, BaseRenderer);


    exports.ImageRenderer = ImageRenderer;

    if (typeof module != "undefined") {
        module.exports = ImageRenderer;
    }

}(CUI));
