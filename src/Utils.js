var CUI = CUI || {};

(function(exports) {

    CUI.ImagePool = CUI.ImagePool || {};
    CUI.ImageMapping = CUI.ImageMapping || {};

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

        parseValue: function(value, relativeValue, autoValue) {
            if (typeof value == "string") {
                value = value.trim();
                if (value === "auto") {
                    return autoValue === undefined ? 0 : autoValue;
                }
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
                    return p1 - p2;
                } else if ((percent = value.lastIndexOf("%")) > 0) {
                    value = (parseFloat(value) / 100) * (relativeValue || 0);
                    return value;
                } else {
                    return parseFloat(value) || 0;
                }
            }
            if (typeof value == "number" || value === true || value === false || value === null || value === undefined) {
                return value;
            }
            return parseFloat(value) || 0;
        },

        createCanvas: function(width, height) {
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            return canvas;
        },

        getTextWidth: function(context, text, size, fontName) {
            var font = context.font;
            context.font = size + "px" + (fontName ? (" " + fontName) : "");
            var measure = context.measureText(text);
            context.font = font;
            return measure.width;
        },

        // createButtonImgByBorderImage: function(w, headWidth, img, sx, sy, sw, sh) {
        //     var h = sh || img.height;
        //     var canvas = Utils.createCanvas(w, h);
        //     var context = canvas.getContext("2d");
        //     Utils.renderBorderImage(context, 0, 0, w, h, 0, headWidth, 0, headWidth, true, img, sx, sy, sw, sh);
        //     return canvas;
        // },
        createImageByBorderImage: function(w, h, T, R, B, L, fill, img, sx, sy, sw, sh) {
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

            if (CH > 0) {
                if (fill === true) {
                    context.drawImage(img, sx + L, sy + T, bw, bh, x + L, y + T, CW, CH);
                } else if (fill) {
                    context.fillStyle = fill;
                    context.fillRect(x + L, y + T, CW, CH);
                }
                context.drawImage(img, sx, sy + T, L, bh, x, y + T, L, CH);
                context.drawImage(img, sx + sw - R, sy + T, R, bh, x + w - R, y + T, R, CH);
            }

            if (T > 0) {
                L > 0 && context.drawImage(img, sx, sy, L, T, x, y, L, T);
                CW > 0 && context.drawImage(img, sx + L, sy, bw, T, x + L, y, CW, T);
                R > 0 && context.drawImage(img, sx + sw - R, sy, R, T, x + w - R, y, R, T);
            }

            if (B > 0) {
                L > 0 && context.drawImage(img, sx, sy + sh - B, L, B, x, y + h - B, L, B);
                CW > 0 && context.drawImage(img, sx + L, sy + sh - B, bw, B, x + L, y + h - B, CW, B);
                R > 0 && context.drawImage(img, sx + sw - R, sy + sh - B, R, B, x + w - R, y + h - B, R, B);
            }
        },

        strokeAABB: function(context, aabb, color, lineWidth) {
            color = color || "red";
            var bak = context.strokeStyle;
            if (lineWidth) {
                context.lineWidth = lineWidth;
            }
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

        getImageInfo: function(idOrImg) {
            var img, id = idOrImg;
            if (typeof id != "string") {
                if (id.tagName) {
                    img = id;
                } else {
                    return null;
                }
            } else {
                img = CUI.ImagePool[id];
            }
            if (img) {
                return {
                    "img": img,
                    "sx": 0,
                    "sy": 0,
                    "sw": img.width,
                    "sh": img.height,

                    "ox": 0,
                    "oy": 0,
                    "w": img.width,
                    "h": img.height,
                }
            }
            var mapping = CUI.ImageMapping[id];
            if (mapping) {
                var imgId = mapping["img"];
                var img = CUI.ImagePool[imgId];
                var info = {
                    "sx": mapping["x"],
                    "sy": mapping["y"],
                    "sw": mapping["w"],
                    "sh": mapping["h"],
                    "ox": mapping["ox"],
                    "oy": mapping["oy"],
                    "w": mapping["sw"],
                    "h": mapping["sh"],
                }
                info.img = img;
                return info;
            } else {
                console.log("Utils.getUIImgInfo err : ", id)
            }
            return null;
        },

        renderImageInfo: function(context, imgInfo, x, y, w, h) {
            x = x || 0;
            y = y || 0;
            context.drawImage(imgInfo.img,
                imgInfo.sx, imgInfo.sy, imgInfo.sw, imgInfo.sh,
                x + imgInfo.ox >> 0, y + imgInfo.oy >> 0, w || imgInfo.sw, h || imgInfo.sh);
        },
        renderInfoImg: function(context, imgInfo, x, y, w, h) {
            x = x || 0;
            y = y || 0;
            context.drawImage(imgInfo.img, imgInfo.sx, imgInfo.sy, imgInfo.sw, imgInfo.sh,
                x, y, w || imgInfo.sw, h || imgInfo.sh);
        },
    };

    exports.Utils = Utils;

    if (typeof module != "undefined") {
        module.exports = Utils;
    }

}(CUI));
