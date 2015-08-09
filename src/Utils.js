var CUI = CUI || {};

(function(exports) {

    var Utils = {

        loadImage: function(src, callback) {
            var img = new Image();
            img.onload = function(event) {
                callback(img, event);
            };
            img.onerror = function(event) {
                callback(null, event);
            };
            img.src = src;
            return img;
        },

        createImgInfo: function(img) {
            return {
                img: img,
                sx: 0,
                sy: 0,
                sw: img.width,
                sh: img.height,
            }
        },

        parseValue: function(value, relativeValue) {
            if (typeof value == "string") {
                value = value.trim();
                var plus, sub, percent, num;
                if ((plus = value.lastIndexOf("+")) > 0) {
                    var p1 = value.substring(0, plus);
                    var p2 = value.substring(plus + 1);
                    p1 = Utils.parseValue(p1, relativeValue);
                    p2 = Utils.parseValue(p2, relativeValue)
                    return p1 + p2;
                } else if ((sub = value.lastIndexOf("-")) > 0) {
                    var p1 = value.substring(0, sub);
                    var p2 = value.substring(sub + 1);
                    p1 = Utils.parseValue(p1, relativeValue);
                    p2 = Utils.parseValue(p2, relativeValue)
                    console.log(p1,p2)
                    return p1 - p2;
                } else if ((percent = value.lastIndexOf("%")) > 0) {
                    value = (parseFloat(value) / 100) * (relativeValue || 0);
                    return value;
                } else {
                    return parseFloat(value);
                }
            }
            if (typeof value == "number" || value === true || value === false || value === null || value === undefined) {
                return value;
            }
            return parseFloat(value) || 0;
        },

        createCanvas: function(width, height) {
            var canvas = document.createElement("canvas");
            canvas.retinaResolutionEnabled = false;
            canvas.width = width;
            canvas.height = height;
            return canvas;
        },

        createImageByBorder: function(w, h, T, R, B, L, fill, img, sx, sy, sw, sh) {
            var canvas = Utils.createCanvas(w, h);
            var context = canvas.getContext("2d");
            Utils.renderBorderImage(context, 0, 0, w, h, T, R, B, L, fill, img, sx, sy, sw, sh);
            return canvas;
        },

        renderBorderImage: function(context, x, y, w, h, T, R, B, L, fill, img, sx, sy, sw, sh) {

            sx = sx || 0;
            sy = sy || 0;
            sw = sw || img.width;
            sh = sh || img.height;

            var bw = sw - L - R;
            var bh = sh - T - B;

            var CW = w - L - R,
                CH = h - T - B;

            if (CH != 0) {
                if (fill === true) {
                    context.drawImage(img, sx + L, sy + T, bw, bh, x + L, y + T, CW, CH);
                } else if (fill) {
                    context.fillStyle = fill;
                    context.fillRect(x + L, y + T, CW, CH);
                }
                context.drawImage(img, sx, sy + T, L, bh, x, y + T, L, CH);
                context.drawImage(img, sx + sw - R, sy + T, R, bh, x + w - R, y + T, R, CH);
            }

            if (T != 0) {
                L != 0 && context.drawImage(img, sx, sy, L, T, x, y, L, T);
                CW != 0 && context.drawImage(img, sx + L, sy, bw, T, x + L, y, CW, T);
                R != 0 && context.drawImage(img, sx + sw - R, sy, R, T, x + w - R, y, R, T);
            }

            if (B != 0) {
                L != 0 && context.drawImage(img, sx, sy + sh - B, L, B, x, y + h - B, L, B);
                CW != 0 && context.drawImage(img, sx + L, sy + sh - B, bw, B, x + L, y + h - B, CW, B);
                R != 0 && context.drawImage(img, sx + sw - R, sy + sh - B, R, B, x + w - R, y + h - B, R, B);
            }
        },

        strokeAABB: function(context, aabb, color) {
            color = color || "red";
            var bak = context.strokeStyle;
            context.strokeStyle = color;
            context.strokeRect(aabb[0], aabb[1], aabb[2] - aabb[0], aabb[3] - aabb[1]);
            context.strokeStyle = bak;
        },

        fillAABB: function(context, aabb, color) {
            color = color || "red";
            var bak = context.fillStyle;
            context.fillStyle = color;
            context.fillRect(aabb[0], aabb[1], aabb[2] - aabb[0], aabb[3] - aabb[1]);
            context.fillStyle = bak;
        },

    };

    exports.Utils = Utils;

    if (typeof module != "undefined") {
        module.exports = Utils;
    }

}(CUI));
