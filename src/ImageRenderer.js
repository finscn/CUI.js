"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

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

        x: 0,
        y: 0,
        width: 0,
        height: 0,
        anchorX: 0,
        anchorY: 0,

        scale: 1,
        scaleX: 1,
        scaleY: 1,
        flipX: false,
        flipY: false,
        rotation: 0,

        visible: true,

        offsetX: 0,
        offsetY: 0,
        offsetW: 0,
        offsetH: 0,
        offsetAlpha: 0,

        setImgInfo: function(img, sx, sy, sw, sh) {
            this.img = img;
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
        },

        setScale: function(scale) {
            this.scale = scale;
            this.scaleX = scale;
            this.scaleY = scale;
        },
        setAnchor: function(x, y) {
            this.anchorX = x;
            this.anchorY = y;
        },

        quickRender: function(context, timeStep, now) {
            var x = this.x - this.anchorX + this.offsetX;
            var y = this.y - this.anchorY + this.offsetY;
            var w = this.width + this.offsetW;
            var h = this.height + this.offsetH;
            context.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, x, y, w, h);
        },

        render: function(context, timeStep, now) {
            if (!this.visible || this.alpha <= 0) {
                return false;
            }

            var x = -this.anchorX;
            var y = -this.anchorY;
            var scaleX = this.scaleX * (this.flipX ? -1 : 1);
            var scaleY = this.scaleY * (this.flipY ? -1 : 1);
            var rotation = this.rotation % this.DOUBLE_PI;
            var alpha = this.alpha + this.offsetAlpha;

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
            context.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, x, y, this.width + this.offsetW, this.height + this.offsetH);

            if (scaleX != 1 || scaleY != 1 || rotation != 0) {
                context.restore();
            } else {
                context.globalAlpha = 1;
            }
        },

    });


    exports.ImageRenderer = ImageRenderer;

    if (typeof module != "undefined") {
        module.exports = ImageRenderer;
    }

}(CUI));
