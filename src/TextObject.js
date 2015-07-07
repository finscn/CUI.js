"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var TextObject = Class.create({

        DEG_TO_RAD: Math.PI / 180,
        RAD_TO_DEG: 180 / Math.PI,
        HALF_PI: Math.PI / 2,
        DOUBLE_PI: Math.PI * 2,

        text:null,
        color:null,
        fontName:null,
        fontSize:null,
        fontWeight:null,

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

        init: function() {
            this.setImg(this.img);
            this.setImgInfo(this.sx, this.sy, this.sw, this.sh);
        },
        setImg: function(img) {
            this.img = img;
        },
        setImgInfo: function(sx, sy, sw, sh) {
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
            context.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, x, y, this.w + this.offsetW, this.h + this.offsetH);

            if (scaleX != 1 || scaleY != 1 || rotation != 0) {
                context.restore();
            } else {
                context.globalAlpha = 1;
            }
        },

    });


    exports.TextObject = TextObject;

    if (typeof module != "undefined") {
        module.exports = TextObject;
    }

}(CUI));
