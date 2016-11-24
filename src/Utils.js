var CUI = CUI || {};

(function(exports) {

    CUI.ImagePool = CUI.ImagePool || {};
    CUI.ImageMapping = CUI.ImageMapping || {};

    var tempCanvas = document.createElement("canvas");
    var tempContext = tempCanvas.getContext("2d");

    var Utils = {

        loadImage: function(src, callback) {
            var img = new Image();
            img.onload = function(event) {
                callback && callback(img, event);
            };
            img.onerror = function(event) {
                callback && callback(null, event);
            };
            img.src = src;
            return img;
        },

        loadImages: function(cfgList, callback) {
            // id  src  onLoad(img)  onError(img)
            var count = cfgList.length;
            var imgPool = {};
            var idx = -1;
            var $next = function() {
                idx++;
                if (idx >= count) {
                    callback && callback(imgPool);
                    return;
                }
                var cfg = cfgList[idx];
                var img = new Image();
                img.src = cfg.src;
                img.id = cfg.id;
                img.onload = function(event) {
                    imgPool[img.id] = img;
                    if (cfg.onLoad) {
                        cfg.onLoad.call(img, img);
                    }
                    $next();
                };
                img.onerror = function(event) {
                    if (cfg.onError) {
                        cfg.onError.call(img, img);
                    }
                    $next();
                };
            }
            $next();
            return imgPool;
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

        getTextWidth: function(text, size, fontName) {
            var ctx = tempContext;
            var font = ctx.font;
            ctx.font = size + "px" + (fontName ? (" " + fontName) : "");
            var measure = ctx.measureText(text);
            ctx.font = font;
            return measure.width;
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
    };

    exports.Utils = Utils;

    if (typeof module != "undefined") {
        module.exports = Utils;
    }

}(CUI));
