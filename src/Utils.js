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

        parseValue: function(value, relativeValue, autoValue) {
            if (typeof value === "string") {
                value = value.trim();
                if (value === "auto") {
                    return autoValue === undefined ? 0 : autoValue;
                }
                var plus, sub, mul, div, percent, num;
                if ((plus = value.lastIndexOf("+")) > 0) {
                    var p1 = value.substring(0, plus);
                    var p2 = value.substring(plus + 1);
                    p1 = Utils.parseValue(p1, relativeValue);
                    p2 = Utils.parseValue(p2, relativeValue);
                    return p1 + p2;
                } else if ((sub = value.lastIndexOf("-")) > 0) {
                    var p1 = value.substring(0, sub);
                    var p2 = value.substring(sub + 1);
                    p1 = Utils.parseValue(p1, relativeValue);
                    p2 = Utils.parseValue(p2, relativeValue);
                    return p1 - p2;
                } else if ((mul = value.lastIndexOf("*")) > 0) {
                    var p1 = value.substring(0, mul);
                    var p2 = value.substring(mul + 1);
                    p1 = Utils.parseValue(p1, relativeValue);
                    p2 = Utils.parseValue(p2, relativeValue);
                    return p1 * p2;
                } else if ((div = value.lastIndexOf("/")) > 0) {
                    var p1 = value.substring(0, div);
                    var p2 = value.substring(div + 1);
                    p1 = Utils.parseValue(p1, relativeValue);
                    p2 = Utils.parseValue(p2, relativeValue);
                    return p1 * p2;
                } else if ((percent = value.lastIndexOf("%")) > 0) {
                    value = (parseFloat(value) / 100) * (relativeValue || 0);
                    return value;
                } else {
                    num = parseFloat(value) || 0;
                    return num;
                }
            }
            if (typeof value === "number" || value === true || value === false || value === null || value === undefined) {
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

        getImageInfo: function(idOrImg, allowNull) {
            var img, id = idOrImg;
            if (typeof id !== "string") {
                if (id.tagName) {
                    img = id;
                    id = img.src;
                } else {
                    return idOrImg;
                }
            } else {
                img = CUI.ImagePool[id];
            }
            if (img) {
                var info = {
                    "id": id,
                    "img": img,
                    "sx": 0,
                    "sy": 0,
                    "sw": img.width,
                    "sh": img.height,

                    "ox": 0,
                    "oy": 0,
                    "w": img.width,
                    "h": img.height,
                };
                return info;
            }
            var mapping = CUI.ImageMapping[id];
            if (mapping) {
                var imgId = mapping["img"];
                var img = CUI.ImagePool[imgId];
                var info = {
                    "id": id,
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
            }
            console.log("Utils.getUIImgInfo err : ", id);
            if (allowNull) {
                return null;
            }
            var info = {
                "id": id,
                "sx": 0,
                "sy": 0,
                "sw": 2,
                "sh": 2,
                "ox": 0,
                "oy": 0,
                "w": 2,
                "h": 2,
                lazy: true,
            }
            info.img = Utils.blankCanvas;
            return info;
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

        //////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////

        setContextColor: function(context, attribute, color, endX, end) {
            if (typeof color === 'string') {
                context[attribute] = color;
            } else {
                var stops = color.stops || color;
                var x0 = color.x0 || 0;
                var y0 = color.y0 || 0;
                var x1 = color.x1 || color.x1 === 0 ? color.x1 : endX;
                var y1 = color.y1 || color.y1 === 0 ? color.y1 : endY;
                var grd = context.createLinearGradient(x0, y0, x1, y1);
                stops.forEach(function(c) {
                    grd.addColorStop(c[0], c[1]);
                });
                context[attribute] = grd;
            }
        },

        setFillColor: function(context, color, endX, end) {
            Utils.setContextColor(context, 'fillStyle', color, endX, end);
        },

        setStrokeColor: function(context, color, endX, end) {
            Utils.setContextColor(context, 'strokeStyle', color, endX, end);
        },

        drawPath: function(context, path, close) {
            var len = path.length;
            var start = path[0];

            context.beginPath();
            context.moveTo(start[0], start[1]);

            var i = 1;
            while (i < len) {
                var p = path[i];
                var size = p.length;

                if (size === 2) {
                    context.moveTo(p[0], p[1]);
                } else {
                    // var type = String(p[size - 1]).toLowerCase();
                    var type = p[size - 1];

                    if (type === 'line') {
                        // 2
                        context.lineTo(p[0], p[1]);
                    } else if (type === 'circle') {
                        // 6
                        context.arc(p[0], p[1], p[2], p[3], p[4], p[5]);
                    } else if (type === 'rect') {
                        // 4
                        var _x = p[0];
                        var _y = p[1];
                        var _w = p[2];
                        var _h = p[3];
                        context.moveTo(_x, _y);
                        context.lineTo(_x + _w, _y);
                        context.lineTo(_x + _w, _y + _h);
                        context.lineTo(_x, _y + _h);
                        context.lineTo(_x, _y);
                    } else if (type === 'arc') {
                        // 5
                        context.arcTo(p[0], p[1], p[2], p[3], p[4]);
                    } else if (type === 'bezier') {
                        // 6
                        context.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5])
                    } else if (type === 'quad' || type === 'quadratic') {
                        // 4
                        context.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                    }
                }

                if (p === start) {
                    break;
                }

                i++;
                if (close && i === len) {
                    i = 0;
                }
            }

            close && context.closePath();
        },

        // mode: 1:round/concave, 2:bevel,
        //       3:trapezoid-h, 4:trapezoid-v,
        //       5:flag-h, 6:flag-v
        // TODO: use drawPath ?
        borderRadiusPath: function(context, x, y, width, height, r1, r2, r3, r4, mode) {
            context.beginPath();

            var abs1 = Math.abs(r1);
            var abs2 = Math.abs(r2);
            var abs3 = Math.abs(r3);
            var abs4 = Math.abs(r4);

            // context.quadraticCurveTo(cpx,cpy,x,y)
            // or
            // arcTo(x1, y1, x2, y2, radius)

            if (mode === 2) {
                context.moveTo(x + abs1, y);

                context.lineTo(x + width - abs2, y);
                abs2 !== 0 && context.lineTo(x + width, y + abs2);
                context.lineTo(x + width, y + height - abs3);
                abs3 !== 0 && context.lineTo(x + width - abs3, y + height);
                context.lineTo(x + abs4, y + height);
                abs4 !== 0 && context.lineTo(x, y + height - abs4);
                context.lineTo(x, y + abs1);
                abs1 !== 0 && context.lineTo(x + abs1, y);

            } else if (mode === 3) {
                context.moveTo(x + abs1, y);

                context.lineTo(x + width - abs2, y);
                context.lineTo(x + width - abs3, y + height);
                context.lineTo(x + abs4, y + height);
                context.lineTo(x + abs1, y);

            } else if (mode === 4) {
                context.moveTo(x, y + abs1);

                context.lineTo(x + width, y + abs2);
                context.lineTo(x + width, y + height - abs3);
                context.lineTo(x, y + height - abs4);
                context.lineTo(x, y + abs1);

            } else if (mode === 5) {
                context.moveTo(x, y);

                context.lineTo(x + width, y);
                abs2 !== 0 && context.lineTo(x + width - abs2, y + height / 2);
                context.lineTo(x + width, y + height);
                context.lineTo(x, y + height);
                abs1 !== 0 && context.lineTo(x + abs1, y + height / 2);
                context.lineTo(x, y);

            } else if (mode === 6) {
                context.moveTo(x, y);

                abs1 !== 0 && context.lineTo(x + width / 2, y + abs1);
                context.lineTo(x + width, y);
                context.lineTo(x + width, y + height);
                abs2 !== 0 && context.lineTo(x + width / 2, y + height - abs2);
                context.lineTo(x, y + height);
                context.lineTo(x, y);

            } else {
                context.moveTo(x + abs1, y);

                context.lineTo(x + width - abs2, y);
                if (r2 < 0) {
                    r2 = -r2;
                    context.arcTo(x + width - r2, y + r2, x + width, y + r2, r2);
                } else if (r2 > 0) {
                    context.arcTo(x + width, y, x + width, y + r2, r2);
                }

                context.lineTo(x + width, y + height - abs3);
                if (r3 < 0) {
                    r3 = -r3;
                    context.arcTo(x + width - r3, y + height - r3, x + width - r3, y + height, r3);
                } else if (r3 > 0) {
                    context.arcTo(x + width, y + height, x + width - r3, y + height, r3);
                }

                context.lineTo(x + abs4, y + height);
                if (r4 < 0) {
                    r4 = -r4;
                    context.arcTo(x + r4, y + height - r4, x, y + height - r4, r4);
                } else if (r4 > 0) {
                    context.arcTo(x, y + height, x, y + height - r4, r4);
                }

                context.lineTo(x, y + abs1);
                if (r1 < 0) {
                    r1 = -r1;
                    context.arcTo(x + r1, y + r1, x + r1, y, r1);
                } else if (r1 > 0) {
                    context.arcTo(x, y, x + r1, y, r1);
                }
            }

            context.closePath();
        },

        fixRadius: function(radius) {
            var radiusFix = [];

            if (!Array.isArray(radius)) {
                radiusFix[0] = radius;
                radiusFix[1] = radius;
                radiusFix[2] = radius;
                radiusFix[3] = radius;
            } else if (radius.length === 4) {
                radiusFix[0] = radius[0];
                radiusFix[1] = radius[1];
                radiusFix[2] = radius[2];
                radiusFix[3] = radius[3];
            } else if (radius.length === 2) {
                radiusFix[0] = radius[0];
                radiusFix[1] = radius[1];
                radiusFix[2] = radius[0];
                radiusFix[3] = radius[1];
            } else if (radius.length === 1) {
                radiusFix[0] = radius[0];
                radiusFix[1] = radius[0];
                radiusFix[2] = radius[0];
                radiusFix[3] = radius[0];
            }

            return radiusFix;
        },

        createRoundRect: function(options, canvas) {
            options = Object.assign({
                mode: 0,

                margin: 0,
                x: 0,
                y: 0,
                width: 0,
                height: 0,

                lineCap: 'round',

                color: null,
                radius: 0,

                borderWidth: 0,
                borderColor: null,
            }, options);

            var mode = options.mode;
            var margin = options.margin;
            var width = options.width;
            var height = options.height;
            var radius = options.radius;
            var color = options.color;

            var borderHalf = options.borderWidth / 2;
            var borderFix = borderHalf; //Math.ceil(borderHalf);
            var x = options.x + margin + borderFix;
            var y = options.y + margin + borderFix;
            var innerWidth = width - borderFix * 2;
            var innerHeight = height - borderFix * 2;

            var radiusFix = Utils.fixRadius(radius);

            radiusFix.forEach(function(v, idx) {
                radiusFix[idx] = Math.max(0, v - borderHalf);
            });

            if (!canvas) {
                var canvasWidth = options.x + width + margin * 2;
                var canvasHeight = options.y + height + margin * 2;

                canvas = Utils.createCanvas(canvasWidth, canvasHeight);
            }
            var context = canvas.getContext("2d");
            context.lineCap = options.lineCap;

            Utils.borderRadiusPath(context, x, y, innerWidth, innerHeight, radiusFix[0], radiusFix[1], radiusFix[2], radiusFix[3], mode);

            if (options.color) {
                Utils.setFillColor(context, options.color, innerWidth, innerHeight);
                context.fill();
            }

            if (options.borderWidth) {
                context.lineWidth = options.borderWidth;
                if (options.borderColor) {
                    Utils.borderRadiusPath(context, x, y, innerWidth, innerHeight, radiusFix[0], radiusFix[1], radiusFix[2], radiusFix[3], mode);
                    Utils.setStrokeColor(context, options.borderColor, innerWidth, innerHeight);
                    context.stroke();
                }
            }

            var textInfo = options.textInfo;
            if (textInfo) {
                var tx = x + textInfo.x || 0;
                var ty = y + textInfo.y || 0;
                context.font = textInfo.font;
                context.textAlign = textInfo.textAlign || "center";
                if (textInfo.shadowColor) {
                    Utils.setFillColor(context, textInfo.shadowColor);
                    context.fillText(textInfo.text, tx + textInfo.shadowOffsetX, ty + textInfo.shadowOffsetY);
                }
                if (textInfo.strokeWidth) {
                    context.lineWidth = textInfo.strokeWidth * 2;
                    Utils.setStrokeColor(context, textInfo.strokeColor);
                    context.strokeText(textInfo.text, tx, ty);
                }
                if (textInfo.color) {
                    Utils.setFillColor(context, textInfo.color);
                    context.fillText(textInfo.text, tx, ty);
                }
            }
            return canvas;
        },

        createRoundRects: function(width, height, rects, canvas) {
            if (arguments.length === 2 && typeof width !== 'number') {
                rects = width;
                canvas = height;
            }
            canvas = canvas || Utils.createCanvas(width, height);

            rects.forEach(function(rectOptions) {
                if (rectOptions) {
                    // width, height, radius, color, options, canvas
                    rectOptions.width = rectOptions.width || width;
                    rectOptions.height = rectOptions.height || height;
                    Utils.createRoundRect(rectOptions, canvas);
                }
            });
            return canvas;
        },

    };

    Utils.blankCanvas = Utils.createCanvas(2, 2);

    exports.Utils = Utils;

    if (typeof module !== "undefined") {
        module.exports = Utils;
    }

}(CUI));
