"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = {
        SN: 0,
    };

    Class.create = function(constructor, proto, superclass) {

        if (typeof constructor === "object" && arguments.length < 3) {
            superclass = proto;
            proto = constructor;

            constructor = function(options) {
                if (this._superInitialize) {
                    this._superInitialize(options);
                }
                if (this.initialize) {
                    this.initialize(options);
                }

                for (var key in options) {
                    this[key] = options[key];
                }

                this._initialized = true;

                if (this.lazyInit === false && this.init) {
                    this.init();
                }
            };
            constructor.classSN = (++Class.SN);
        }

        var _proto = constructor.prototype;
        for (var p in proto) {
            _proto[p] = proto[p];
        }
        _proto._superInitialize = function(options) {
            var $super = constructor.$super;
            if ($super) {
                if ($super._superInitialize) {
                    $super._superInitialize.call(this, options);
                }
                if ($super.initialize) {
                    $super.initialize.call(this, options);
                }
            }
        };

        Class.extend(constructor, superclass);

        return constructor;
    };

    Class.extend = function(subclass, superclass) {
        var constructor = subclass;
        var proto = constructor.prototype;

        superclass = constructor.superclass = superclass || constructor.superclass || proto.superclass;

        var superProto;
        if (typeof superclass === "function") {
            superProto = superclass.prototype;
        } else {
            superProto = superclass;
        }

        for (var key in superProto) {
            // if (Object.hasOwnProperty(proto, key) !== (key in proto)) {
            //     // console.log(key)
            // }
            if (!(key in proto) && key !== "constructor") {
                var desc = Object.getOwnPropertyDescriptor(superProto, key);
                if (desc) {
                    Object.defineProperty(proto, key, desc);
                } else {
                    proto[key] = superProto[key];
                }
            }
        }

        // === Call super-method ===
        // SubClass.$super.method.call(this,args);
        //  -- or --
        // SuperClass.prototype.method.call(this,args);

        constructor.$super = superProto;
        constructor.superclass = superclass;
        proto.superclass = superclass;
        if (!proto.constructor) {
            proto.constructor = constructor;
        }

        return subclass;
    };

    Class.defineProperties = function(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            var enumerable = descriptor.enumerable;
            descriptor.enumerable = enumerable !== false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    };

    exports.Class = Class;

    if (typeof module !== "undefined") {
        module.exports = Class;
    }

}(CUI));

var CUI = CUI || {};

(function(exports) {

    CUI.ImagePool = CUI.ImagePool || {};
    CUI.ImageMapping = CUI.ImageMapping || {};

    var textHelperCanvas = document.createElement("canvas");
    var textHelperContext = textHelperCanvas.getContext("2d");

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

        getExistValue: function(value, defaultValue) {
            return value !== null && value !== undefined ? value : defaultValue;
        },

        createCanvas: function(width, height) {
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            return canvas;
        },

        getImageInfo: function(idOrImg, allowNull) {
            var img, id = idOrImg;

            if (idOrImg) {
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

        setContextColor: function(context, attribute, color, endX, endY) {
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

        setFillColor: function(context, color, endX, endY) {
            Utils.setContextColor(context, 'fillStyle', color, endX, endY);
        },

        setStrokeColor: function(context, color, endX, endY) {
            Utils.setContextColor(context, 'strokeStyle', color, endX, endY);
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
                    if (r2 > height) {
                        context.lineTo(x + width, y + height);
                    } else {
                        context.arcTo(x + width, y, x + width, y + r2, r2);
                    }
                }

                context.lineTo(x + width, y + height - Math.min(height, abs3));
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
                    if (r4 > height) {
                        context.lineTo(x, y);
                    } else {
                        context.arcTo(x, y + height, x, y + height - r4, r4);
                    }
                }

                context.lineTo(x, y + Math.min(height, abs1));
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
                // Utils.setFillColor(context, options.color, innerWidth, innerHeight);
                Utils.setFillColor(context, options.color, 0, innerHeight);
                context.fill();
            }

            if (options.borderWidth) {
                context.lineWidth = options.borderWidth;
                if (options.borderColor) {
                    Utils.borderRadiusPath(context, x, y, innerWidth, innerHeight, radiusFix[0], radiusFix[1], radiusFix[2], radiusFix[3], mode);
                    // Utils.setStrokeColor(context, options.borderColor, innerWidth, innerHeight);
                    Utils.setStrokeColor(context, options.borderColor, 0, innerHeight);
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

        createButtonRect: function(options) {
            var bg = new CUI.ButtonBackground(options);
            bg.init();
            return bg.image;
        },

        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////

        getStringLength: function(str) {
            var len = str.length;
            var realLen = 0;
            for (var i = 0; i < len; i++) {
                if ((str.charCodeAt(i) & 0xff00) !== 0) {
                    realLen += 2;
                } else {
                    realLen += 1;
                }
            }
            return realLen;
        },

        getMaxLine: function(lines) {
            var count = lines.length;
            var row = 0;
            if (count > 1) {
                var max = 0;
                for (var i = 0; i < count; i++) {
                    var len = Utils.getStringLength(lines[i]);
                    if (len > max) {
                        max = len;
                        row = i;
                    }
                }
            }
            return lines[row];
        },


        getTextWidth: function(text, size, fontName) {
            var fontStyle = size + "px" + (fontName ? (" " + fontName) : "");
            var measure = Utils.measureText(text, fontStyle);
            return measure.width;
        },

        measureText: function(text, fontStyle) {
            var lines;
            if (Array.isArray(text)) {
                lines = text;
            } else {
                lines = String(text).split(/(?:\r\n|\r|\n)/);
            }

            var ctx = textHelperContext;
            var prevFont = ctx.font;
            ctx.font = fontStyle;

            var maxLine = CUI.Utils.getMaxLine(lines);
            var measure = ctx.measureText(maxLine);

            measure = measure || { width: 0 };
            ctx.font = prevFont;
            return measure;
        },

        createTextCanvas: function(textLines, style) {
            var textInfo = {};
            for (var p in style) {
                textInfo[p] = style[p]
            }
            textInfo.lines = textLines;

        },

        renderTextContent: function(context, textInfo, x, y) {

            // var bak = context.lineWidth;
            // context.lineWidth = 6;
            // context.strokeStyle = "#0000FF";
            // context.strokeRect(0, 0, context.canvas.width, context.canvas.height)
            // context.fillStyle = "#0000FF";
            // context.fillRect(0, 0, context.canvas.width, context.canvas.height)
            // context.lineWidth = bak;

            // context.globalAlpha = textInfo.alpha;
            context.font = textInfo.fontStyle;
            // context.textAlign = "left";
            context.textAlign = textInfo.textAlign || "left";

            var strokeWidth = textInfo.strokeWidth || 1;

            x += strokeWidth / 2;

            if (textInfo.textBaseline === "top") {
                context.textBaseline = 'alphabetic';
                y += (textInfo.fontSize + strokeWidth / 2);
            } else if (textInfo.textBaseline === "bottom") {
                context.textBaseline = 'alphabetic';
                y -= (textInfo.fontSize / 4 + strokeWidth / 2);
            } else if (textInfo.textBaseline === "middle") {
                context.textBaseline = 'alphabetic';
                y += (textInfo.fontSize / 2 - textInfo.fontSize / 4);
            } else {
                context.textBaseline = textInfo.textBaseline;
            }

            var stroke = textInfo.strokeColor !== null;

            var bakShadow;
            if (textInfo.shadowColor !== null) {
                bakShadow = {
                    blur: context.shadowBlur,
                    color: context.shadowColor,
                    offsetX: context.shadowOffsetX,
                    offsetY: context.shadowOffsetY,
                };
                context.shadowBlur = textInfo.shadowBlur;
                context.shadowColor = textInfo.shadowColor;
                context.shadowOffsetX = textInfo.shadowOffsetX;
                context.shadowOffsetY = textInfo.shadowOffsetY;

                // context.fillStyle = textInfo.shadowColor;
                // if (stroke) {
                //     context.strokeStyle = textInfo.strokeColor;
                // }
                // this.renderTextLines(context, textInfo.lines, textInfo.lineHeight, x + textInfo.shadowOffsetX, y + textInfo.shadowOffsetY, stroke);
            }

            if (stroke) {
                context.lineCap = textInfo.lineCap;
                context.lineJoin = textInfo.lineJoin;
                // TODO
                context.lineWidth = strokeWidth * 2;
                context.strokeStyle = textInfo.strokeColor;
            }

            if (textInfo.color !== null) {
                context.fillStyle = textInfo.color;
            }

            this.renderTextLines(context, textInfo.lines, textInfo.lineHeight, x, y, stroke);

            if (bakShadow) {
                context.shadowBlur = bakShadow.blur;
                context.shadowColor = bakShadow.color;
                context.shadowOffsetX = bakShadow.offsetX;
                context.shadowOffsetY = bakShadow.offsetY;
            }
            // context.textAlign = prevTextAlign;
            // context.globalAlpha = prevAlpha;
        },

        renderTextLines: function(context, lines, lineHeight, x, y, stroke) {
            var Me = this;
            if (lines.length > 1) {
                lines.forEach(function(line) {
                    Me.renderText(context, line, x, y, stroke);
                    y += lineHeight;
                });
            } else {
                Me.renderText(context, lines[0], x, y, stroke);
            }
        },

        renderText: function(context, text, x, y, stroke) {
            if (!text) {
                return;
            }
            if (stroke) {
                context.strokeText(text, x, y);
            }
            context.fillText(text, x, y);
        },

    };

    Utils.blankCanvas = Utils.createCanvas(2, 2);

    exports.Utils = Utils;

    if (typeof module !== "undefined") {
        module.exports = Utils;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var noop = function() {};

    var Core = Class.create({

        initialize: function() {
            this.id = null;
            this.lazyInit = false;

            // 以像素为单位的定位和大小, 单位:像素
            this.pixel = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                baseX: 0,
                baseY: 0,

                relativeX: 0,
                relativeY: 0,

                // For Component
                paddingLeft: 0,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,

                marginLeft: 0,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,

                realMarginLeft: 0,
                realMarginTop: 0,
                realMarginRight: 0,
                realMarginBottom: 0,

                innerWidth: 0,
                innerHeight: 0,
                realOuterWidth: 0,
                realOuterHeight: 0,
            };

            this.root = null;
            this.parent = null;
            this.displayObject = null;
            this.aabb = null;

            // 默写组件支持 "auto" , 根据布局和子元素来确定自己的宽高
            // 支持 混合单位, 如 "100% - 25" , 意思为 父容器的100%再减去25像素.
            this.width = null;
            this.height = null;

            this.relativeX = 0;
            this.relativeY = 0;

            this.zIndex = 0;
            this.offsetX = 0;
            this.offsetY = 0;

            this.alignH = "left"; //  "left" "center" "right";
            this.alignV = "top"; //  "top" "center/middle" "bottom";

            this._visible = true;
            this._alpha = 1;
            this._tint = null;
            this._rotation = 0;

            // 缩放只适合用来做瞬间的、纯视觉上的动画效果, 它不会改变UI的响应区域和行为
            // 如果要真正改变UI的大小, 请通过修改UI(以及内部元素的)width/height来实现
            this._scale = 1;
            this._scaleX = 1;
            this._scaleY = 1;

            this._flipX = false;
            this._flipY = false;

            // 绝对定位和大小, 单位:像素
            this._absoluteX = 0;
            this._absoluteY = 0;
            this._absoluteWidth = 0;
            this._absoluteHeight = 0;

            this._displayWidth = 0;
            this._displayHeight = 0;

            // For Component
            // 缩放/旋转 时才需要
            this._anchor = 0;
            this._anchorX = 0;
            this._anchorY = 0;
            this._pivotX = 0;
            this._pivotY = 0;

            this._offsetX = 0;
            this._offsetY = 0;

            this._displayOffsetX = 0;
            this._displayOffsetY = 0;

            this._sizeChanged = true;
            this._positionChanged = true;
            this._needToCompute = true;
        },

        addChildDisplayObject: function(child) {
            if (!child) {
                return;
            }
            if (!this.displayObject) {
                this.initDisplayObject();
            }

            if (child.displayObject) {
                if (child.insertIndex || child.insertIndex === 0) {
                    this.displayObject.addChildAt(child.displayObject, child.insertIndex);
                } else {
                    this.displayObject.addChild(child.displayObject);
                }
            }
        },

        removeChildDisplayObject: function(child) {
            if (!child || !this.displayObject) {
                return;
            }

            if (child.displayObject) {
                this.displayObject.removeChild(child.displayObject);
            }
        },

        // TODO
        cacheAsCanvas: function(width, height) {
            var x = this._absoluteX;
            var y = this._absoluteY;
            width = width || this._absoluteWidth;
            height = height || this._absoluteHeight;

            var canvas = Core.getCanvasFromPool(this.id);
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext("2d");
            var renderer = new CUI.CanvasRenderer({
                context: context
            });
            // TODO
            renderer.render(this.displayObject);
            return canvas;
        },

        initDisplayObject: noop,

        // TODO
        syncDisplayObject: function() {
            this.visible = this._visible;
            this.alpha = this._alpha;
            this.tint = this._tint;
            this.rotation = this._rotation;
            // this.scale = this._scale;
            this.scaleX = this._scaleX;
            this.scaleY = this._scaleY;

            // this.anchor = this._anchor;
            this.anchorX = this._anchorX;
            this.anchorY = this._anchorY;

            this.zIndex = this._zIndex;
            this.offsetX = this._offsetX;
            this.offsetY = this._offsetY;
        },

        savePreviousState: function() {
            this._prevX = this._absoluteX;
            this._prevY = this._absoluteY;
            this._prevWidth = this._absoluteWidth;
            this._prevHeight = this._absoluteHeight;
        },

        syncPositionX: noop,
        syncPositionY: noop,

        syncDisplayWidth: noop,
        syncDisplayHeight: noop,

        updateDisplayObject: function(img, x, y, w, h) {
            // do nothing.
        },

        destroy: noop
    });

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    var properties = [

        {
            key: 'x',
            get: function() {
                return this._left;
            },
            set: function(value) {
                this.left = value;
            }
        },

        {
            key: 'y',
            get: function() {
                return this._top;
            },
            set: function(value) {
                this.top = value;
            }
        },

        {
            key: 'left',
            get: function() {
                return this._left;
            },
            set: function(value) {
                if (this._left === value) {
                    return;
                }
                this._movedX = false;
                this._positionChanged = true;
                this._left = value;
            }
        },

        {
            key: 'right',
            get: function() {
                return this._right;
            },
            set: function(value) {
                if (this._right === value) {
                    return;
                }
                this._movedX = false;
                this._positionChanged = true;
                this._right = value;
            }
        },

        {
            key: 'top',
            get: function() {
                return this._top;
            },
            set: function(value) {
                if (this._top === value) {
                    return;
                }
                this._movedY = false;
                this._positionChanged = true;
                this._top = value;
            }
        },

        {
            key: 'bottom',
            get: function() {
                return this._bottom;
            },
            set: function(value) {
                if (this._bottom === value) {
                    return;
                }
                this._movedY = false;
                this._positionChanged = true;
                this._bottom = value;
            }
        },

        {
            key: 'width',
            get: function() {
                return this._width;
            },
            set: function(value) {
                if (this._width === value) {
                    return;
                }
                this._sizeChanged = true;
                this._width = value;
            }
        },

        {
            key: 'height',
            get: function() {
                return this._height;
            },
            set: function(value) {
                if (this._height === value) {
                    return;
                }
                this._sizeChanged = true;
                this._height = value;
            }
        },

        {
            key: 'align',
            get: function() {
                return this.alignH;
            },
            set: function(value) {
                this.alignH = value;
            }
        },

        {
            key: 'valign',
            get: function() {
                return this.alignV;
            },
            set: function(value) {
                this.alignV = value;
            }
        },

        {
            key: 'visible',
            get: function() {
                return this._visible;
            },
            set: function(value) {
                this._visible = value;
                this.displayObject && (this.displayObject.visible = value);
            }
        },

        {
            key: 'alpha',
            get: function() {
                return this._alpha;
            },
            set: function(value) {
                this._alpha = value;
                if (this.displayObject) {
                    this.displayObject.alpha = value;
                    this.displayObject._absoluteAlpha = value;
                }
            }
        },

        {
            key: 'tint',
            get: function() {
                return this._tint;
            },
            set: function(value) {
                this._tint = value;
                if (this.displayObject) {
                    this.displayObject.tint = value === null ? 0xFFFFFF : value;
                }
            }
        },

        {
            key: 'rotation',
            get: function() {
                return this._rotation;
            },
            set: function(value) {
                this._rotation = value;
                this.displayObject && (this.displayObject.rotation = value);
            }
        },

        {
            key: 'zIndex',
            get: function() {
                return this._zIndex;
            },
            set: function(value) {
                this._zIndex = value;
                this.parent && (this.parent._toSortChildren = true);
                this.displayObject && (this.displayObject.zIndex = value);
            }
        },

        {
            key: 'offsetX',
            get: function() {
                return this._offsetX;
            },
            set: function(value) {
                this._offsetX = value;
                this.syncPositionX();
            }
        },

        {
            key: 'offsetY',
            get: function() {
                return this._offsetY;
            },
            set: function(value) {
                this._offsetY = value;
                this.syncPositionY();
            }
        },

        {
            key: 'anchor',
            get: function() {
                return this._anchor;
            },
            set: function(value) {
                this._anchor = value;
                this.anchorX = value;
                this.anchorY = value;
            }
        },

        {
            key: 'anchorX',
            get: function() {
                return this._anchorX;
            },
            set: function(value) {
                this._anchorX = value;
                this._anchor = value;
                this.syncDisplayWidth();
            }
        },

        {
            key: 'anchorY',
            get: function() {
                return this._anchorY;
            },
            set: function(value) {
                this._anchorY = value;
                this._anchor = value;
                this.syncDisplayHeight();
            }
        },

        {
            key: 'scale',
            get: function() {
                return this._scale;
            },
            set: function(value) {
                this._scale = value;
                this.scaleX = value;
                this.scaleY = value;
            }
        },

        {
            key: 'scaleX',
            get: function() {
                return this._scaleX;
            },
            set: function(value) {
                value = Math.abs(value);
                this._scaleX = value;
                this._scale = value;
                this.syncDisplayWidth();
            }
        },

        {
            key: 'scaleY',
            get: function() {
                return this._scaleY;
            },
            set: function(value) {
                value = Math.abs(value);
                this._scaleY = value;
                this._scale = value;
                this.syncDisplayHeight();
            }
        },

        {
            key: 'flipX',
            get: function() {
                return this._flipX;
            },
            set: function(value) {
                this._flipX = value;
                this.syncDisplayWidth();
            }
        },

        {
            key: 'flipY',
            get: function() {
                return this._flipY;
            },
            set: function(value) {
                this._flipY = value;
                this.syncDisplayHeight();
            }
        },

        {
            key: 'absoluteX',
            get: function() {
                return this._absoluteX;
            },
            set: function(value) {
                // if (this._absoluteX === value) {
                //     return;
                // }
                this._positionChanged = true;
                this._absoluteX = value;
                if (this.displayObject) {
                    this.displayObject.position.x = this.relativeX + this._pivotX + this._displayOffsetX;
                }
            }
        },

        {
            key: 'absoluteY',
            get: function() {
                return this._absoluteY;
            },
            set: function(value) {
                // if (this._absoluteY === value) {
                //     return;
                // }
                this._positionChanged = true;
                this._absoluteY = value;
                if (this.displayObject) {
                    this.displayObject.position.y = this.relativeY + this._pivotY + this._displayOffsetY;
                }
            }
        },

        {
            key: 'absoluteWidth',
            get: function() {
                return this._absoluteWidth;
            },
            set: function(value) {
                if (this._absoluteWidth === value) {
                    return;
                }
                this._sizeChanged = true;
                this._absoluteWidth = value;
                var pixel = this.pixel;
                pixel.innerWidth = value - pixel.paddingLeft - pixel.paddingRight;
                this.syncDisplayWidth();
            }
        },

        {
            key: 'absoluteHeight',
            get: function() {
                return this._absoluteHeight;
            },
            set: function(value) {
                if (this._absoluteHeight === value) {
                    return;
                }
                this._sizeChanged = true;
                this._absoluteHeight = value;
                var pixel = this.pixel;
                pixel.innerHeight = value - pixel.paddingTop - pixel.paddingBottom;
                this.syncDisplayHeight();
            }
        },
    ];

    Class.defineProperties(Core.prototype, properties);

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    Core._SN = 0;

    Core.canvasPool = {};
    Core.getCanvasFromPool = function(id) {
        var canvas = Core.canvasPool[id];
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = id;
            canvas.width = 3;
            canvas.height = 3;
            // canvas.holderId = id;
            Core.canvasPool[id] = canvas;
        }
        return canvas;
    };

    exports.Core = Core;

    exports.DEG_TO_RAD = Math.PI / 180;
    exports.RAD_TO_DEG = 180 / Math.PI;
    exports.HALF_PI = Math.PI / 2;
    exports.DOUBLE_PI = Math.PI * 2;

    exports.noop = noop;

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var Composite = Class.create({

        addChild: function(child) {
            child.id = (child.id || child.id === 0) ? child.id : Composite.generateId();
            this.childrenMap[child.id] = child;
            this.children.push(child);
            child.parent = this;
        },
        getChildById: function(id) {
            return this.childrenMap[id];
        },
        getChildAt: function(index) {
            return this.children[index];
        },

        _removeChild: function(child) {},

        removeChild: function(child) {
            var index = this.indexOf(child);
            if (index >= 0) {
                this.children.splice(index, 1);
                delete this.childrenMap[child.id];
                child.parent = null;
                return child;
            }
            return false;
        },
        removeChildById: function(id) {
            var child = this.childrenMap[id];
            if (child) {
                return this.removeChild(child);
            }
            return false;
        },
        removeChildAt: function(index) {
            var child = this.children[index];
            if (child) {
                this.children.splice(index, 1);
                delete this.childrenMap[child.id];
                child.parent = null;
                return child;
            }
            return false;
        },

        removeAllChildren: function() {
            for (var i = 0, len = this.children.length; i < len; i++) {
                var child = this.children[i];
                if (this.removeChild(child)) {
                    i--;
                    len--;
                }
            }
            this.children.length = 0;
        },

        indexOf: function(child) {
            for (var i = 0, len = this.children.length; i < len; i++) {
                if (this.children[i] === child) {
                    return i;
                }
            }
            return -1;
        },
        hasChild: function(child) {
            return !!this.children[child.id];
        },
        sortChildrenBy: function(key) {
            Composite.insertSort(this.children, key);
        },
    });

    Composite._ID_SEED = 0;
    Composite.generateId = function() {
        Composite._ID_SEED++;
        var id = "comp_" + Composite._ID_SEED;
        return id;
    };

    Composite.insertSort = function(array, sortKey) {
        var t1, t2;
        var count = array.length;
        for (var i = 1; i < count; i++) {
            t1 = array[i];
            var sortValue = t1[sortKey];
            for (var j = i; j > 0 && (t2 = array[j - 1])[sortKey] > sortValue; j--) {
                array[j] = t2;
            }
            array[j] = t1;
        }
    };

    Composite.applyTo = function(object, override) {
        var proto = Composite.prototype;
        // override = override !== false;
        for (var p in proto) {
            var v = proto[p];
            if (typeof v === "function") {
                (override || !object[p]) && (object[p] = v);
            }
        }
        (override || !object.children) && (object.children = []);
        (override || !object.childrenMap) && (object.childrenMap = {});
        return object;
    };


    exports.Composite = Composite;

    if (typeof module !== "undefined") {
        module.exports = Composite;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var EventDispatcher = Class.create({

        _listeners: null,

        removeAllEventListeners: function() {
            for (var type in this._listeners) {
                this._listeners[type] = null;
            }
            this._listeners = {};
        },

        addEventListener: function(type, listener) {
            var listeners = this._listeners;
            if (listeners[type] === undefined) {
                listeners[type] = [];
            }
            if (listeners[type].indexOf(listener) === -1) {
                listeners[type].push(listener);
            }
        },

        hasEventListener: function(type, listener) {
            var listeners = this._listeners;
            if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {
                return true;
            }
            return false;
        },

        removeEventListener: function(type, listener) {
            var listeners = this._listeners[type];
            if (listeners !== undefined) {
                var index = listeners.indexOf(listener);
                if (index !== -1) {
                    listeners.splice(index, 1);
                    return listener;
                }
            }
            return null;
        },

        dispatch: function(type, args) {
            var listeners = this._listeners[type];
            var dispatched = false;
            // console.log(type)
            if (listeners) {
                args = Array.prototype.slice.call(arguments, 1);
                for (var i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].apply(this, args);
                    dispatched = true;
                }
            }
            return dispatched;
        },

        getEventListeners: function(type) {
            if (!type) {
                return this._listeners;
            }
            return this._listeners[type];
        },

        removeEventListeners: function(type) {
            if (!type) {
                var ls = this._listeners;
                this._listeners = {};
                return ls;
            }
            var ls = this._listeners[type] || null;
            if (ls) {
                this._listeners[type] = [];
            }
            return ls;
        },

    });

    EventDispatcher.applyTo = function(object, override) {
        var proto = EventDispatcher.prototype;
        // override = override !== false;
        for (var p in proto) {
            var v = proto[p];
            if (typeof v === "function") {
                (override || !object[p]) && (object[p] = v);
            }
        }
        (override || !object._listeners) && (object._listeners = {});
        return object;
    };

    exports.EventDispatcher = EventDispatcher;

    if (typeof module !== "undefined") {
        module.exports = EventDispatcher;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var TouchTarget = Class.create({

        modalFlag: -0x10000,
        catchFlag: -0x10001,

        // return: boolean, component,  string(id)
        checkTouch: function(type /* , args... */ ) {
            if (!this.visible || this.alpha <= 0) {
                return false;
            }

            var argsList = Array.prototype.slice.call(arguments, 1);

            // if (type !== "swipe") {
            //     var x = argsList[0],
            //         y = argsList[1];
            //     if (!this.containPoint(x, y)) {
            //         if (this.modal) {
            //             if (type === "tap") {
            //                 this.onTapOut.apply(this, argsList);
            //             }
            //             return this.modalFlag;
            //         }
            //         return false;
            //     }
            // }

            var x = argsList[0],
                y = argsList[1];

            if (!this.containPoint(x, y)) {
                if (this.modal) {
                    if (type === "tap") {
                        this.onTapOut.apply(this, argsList);
                    } else if (type === "touchEnd") {
                        if (this.composite) {
                            this.checkTouchChildren(arguments);
                        }
                        this[type].apply(this, argsList);
                    }
                    return this.modalFlag;
                }
                // if (type === "tap" || type === "touchStart" || type === "touchEnd") {
                if (type === "tap" || type === "touchStart") {
                    return false;
                }
            }

            if (this.composite) {
                var rs = this.checkTouchChildren(arguments);
                if (rs !== false) {
                    return rs;
                }
            }

            var rs = false;
            if (this[type]) {
                rs = this[type].apply(this, argsList);
                if (rs !== false) {
                    rs = this;
                }
            }

            if (rs === false) {
                if (this.modal) {
                    return this.modalFlag;
                }

                if (type === "tap" || type === "touchStart") {
                    return this.catchFlag;
                }
            }

            return rs;
        },

        checkTouchChildren: function(args) {
            if (this.disabled) {
                return false;
            }
            var list = this.getTouchableChildren();
            if (list) {
                for (var i = list.length - 1; i >= 0; i--) {
                    var ui = list[i];
                    if (!ui.visible || ui.alpha <= 0) {
                        continue;
                    }
                    var rs = ui.checkTouch.apply(ui, args);
                    if (!ui.hollow && rs !== false) {
                        // return ui;
                        return rs;
                    }
                }
            }
            return false;
        },

        ///////////////////////////////////////////////////////

        getTouchableChildren: function() {
            return this.children;
        },

        ///////////////////////////////////////////////////////

        touchStart: function(x, y, id) {
            return this.onTouchStart(x, y, id);
        },
        touchEnd: function(x, y, id) {
            return this.onTouchEnd(x, y, id);
        },
        touchMove: function(x, y, id) {
            return this.onTouchMove(x, y, id);
        },

        ///////////////////////////////////////////////////////

        tap: function(x, y, id) {
            return this.onTap(x, y, id);
        },
        pan: function(x, y, dx, dy, startX, startY, id) {
            return this.onPan(x, y, dx, dy, startX, startY, id);
        },
        swipe: function(x, y, vx, vy, startX, startY, id) {
            return this.onSwipe(x, y, vx, vy, startX, startY, id);
        },
        tapOut: function(x, y, id) {
            return this.onTapOut(x, y, id);
        },

        ///////////////////////////////////////////////////////
        // Return `true` to block event
        ///////////////////////////////////////////////////////

        onTouchStart: function(x, y, id) {
            return false;
        },

        onTouchMove: function(x, y, id) {
            return false;
        },

        onTouchEnd: function(x, y, id) {
            return false;
        },

        onTap: function(x, y, id) {
            return false;
        },

        onPan: function(x, y, dx, dy, startX, startY, id) {
            return false;
        },

        onSwipe: function(x, y, vx, vy, startX, startY, id) {
            return false;
        },

        onTapOut: function(x, y, id) {
            return false;
        },

    });

    TouchTarget.applyTo = function(object, override) {
        var proto = TouchTarget.prototype;
        for (var p in proto) {
            var v = proto[p];
            if (typeof v === "function" || p === "modalFlag") {
                (override || !object[p]) && (object[p] = v);
            }
        }
        return object;
    };

    exports.TouchTarget = TouchTarget;

    if (typeof module !== "undefined") {
        module.exports = TouchTarget;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var FontMapping = {

    };

    var Font = {
        getName: function(name, style) {
            var mname = FontMapping[style ? name + " " + style : name];
            if (mname) {
                name = mname;
            } else {
                // name = FontMapping["default"];
            }
            return name;
        },

        getStyle: function(size, name, weight) {
            size = size || 12;
            if (weight === "normal") {
                weight = null;
            }
            return (weight ? weight + " " : "") + size + "px " + name;
        }

    };

    exports.Font = Font;
    exports.FontMapping = FontMapping;

    if (typeof module !== "undefined") {
        module.exports = Font;
        module.exports = FontMapping;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var ButtonComponent = function() {

    };

    var proto = {

        doUp: function(x, y, id) {
            this.touchId = null;
            this.pressed = false;
            this.onUp(x, y, id);
        },
        doDown: function(x, y, id) {
            this.pressed = true;
            this.onDown(x, y, id);
        },

        touchStart: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.touchId = id;
            this.onTouchStart(x, y, id);
            this.doDown(x, y, id);
        },

        pan: function(x, y, dx, dy, sx, sy, id) {
            if (this.disabled) {
                return false;
            }
            if (this.touchId === id) {
                if (this.containPoint(x, y)) {
                    this.onPan(x, y, dx, dy, sx, sy, id);
                } else {
                    this.doUp(x, y, id);
                    this.onMoveOut(x, y, dx, dy, sx, sy, id);
                }
            }
            return false;
        },

        touchEnd: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            if (this.touchId === id) {
                this.doUp(x, y, id);
                if (this.containPoint(x, y)) {
                    return this.onTouchEnd(x, y, id);
                }
            }
            return false;
        },

        swipe: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            if (this.touchId === id) {
                this.doUp(x, y, id);
            }
            return false;
        },

        tap: function(x, y, id) {
            if (this.disabled) {
                return;
            }
            this.beforeTap(x, y, id);
            var rs = this.onTap(x, y, id);
            this.afterTap(x, y, id);
            return rs;
        },
        beforeTap: function(x, y, id) {},
        afterTap: function(x, y, id) {},

        onDown: function(x, y, id) {

        },
        onUp: function(x, y, id) {

        },
        onTap: function(x, y, id) {

        },
        onPan: function(x, y, dx, dy, sx, sy, id) {

        },
        onMoveOut: function(x, y, dx, dy, sx, sy, id) {

        },
    };

    ButtonComponent.applyTo = function(object, override) {
        override = override === true;
        for (var p in proto) {
            if (override || !(p in object)) {
                object[p] = proto[p];
            }
        }
    };

    exports.ButtonComponent = ButtonComponent;

    if (typeof module !== "undefined") {
        module.exports = ButtonComponent;
    }

}(CUI));
"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var Slider = Class.create({

        initialize: function() {
            this.velX = 0;
            this.velY = 0;
            this.accX = 0;
            this.accY = 0;
            this.damping = 0.003;
            this.dx = 0;
            this.dy = 0;
            this.entity = null;
        },

        init: function(entity) {
            this.entity = entity || this.entity;
        },

        reset: function() {
            this.started = false;
            this.toStart = false;

            var entity = this.entity;
            this.dx = this.dy = this.velX = this.velY = this.accX = this.accY = 0;
        },

        start: function(vx, vy, force) {
            if (this.toStart || force) {
                // vx*=0.75;
                // vy*=0.75;

                var entity = this.entity;
                this.velX = vx || 0;
                this.velY = vy || 0;

                this.toStart = false;
                this.started = true;
            } else {
                this.started = false;
            }
        },

        stop: function() {
            this.reset();
        },

        applyDamping: function(timeStep) {
            var d = 1 - timeStep * this.damping;
            (d < 0) && (d = 0);
            (d > 1) && (d = 1);
            this.velX *= d;
            this.velY *= d;
        },

        update: function(timeStep) {
            if (!this.started) {
                return false;
            }
            var entity = this.entity;

            var lastVelX = this.velX;
            var lastVelY = this.velY;
            this.applyDamping(timeStep);

            // var dx = (lastVelX+this.velX) / 2 * timeStep;
            // var dy = (lastVelY+this.velY) / 2 * timeStep;


            if (Math.abs(this.velX) > 0.033 || Math.abs(this.velY) > 0.033) {
                var dx = this.velX * timeStep;
                var dy = this.velY * timeStep;

                this.dx = dx;
                this.dy = dy;

                return true;

            } else {

                this.stop();

                return false;
            }
        }

    });

    exports.Slider = Slider;

    if (typeof module !== "undefined") {
        module.exports = Slider;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var BaseLayout = Class.create({

        initialize: function() {
            this.lazyInit = false;
            this.flexible = false;

            this.relativeX = 0;
            this.relativeY = 0;
            this.pixel = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                baseX: 0,
                baseY: 0,
                relativeX: 0,
                relativeY: 0,
            };
        },

        init: function() {

        },

        compute: function(parent) {
            // console.log("compute.BaseLayout", parent.id, parent.name || "");
            if (parent._width !== "auto" && parent._height !== "auto") {
                return;
            }

            var children = parent.children;
            var childCount = children.length;
            if (childCount === 0) {
                return;
            }

            var idx = 0;
            var parentPixel = parent.pixel;
            var totalWidth = 0;
            var totalHeight = 0;
            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];

                if (child.ignoreLayout !== true) {
                    var rightSpace = Math.max(parent.pixel.paddingRight, child.pixel.marginRight);
                    totalWidth = Math.max(totalWidth, child.relativeX + child._absoluteWidth + rightSpace);

                    var bottomSpace = Math.max(parentPixel.paddingBottom, child.pixel.marginBottom);
                    totalHeight = Math.max(totalHeight, child.relativeY + child._absoluteHeight + bottomSpace);
                }
            }

            this.tryToResizeParent(parent, totalWidth, totalHeight);
        },

        tryToResizeParent: function(parent, width, height) {
            var resize = false;
            if (parent._width === "auto" && parent._absoluteWidth !== width) {
                parent.pixel.width = width;
                parent.absoluteWidth = width;
                resize = true;
            }
            if (parent._height === "auto" && parent._absoluteHeight !== height) {
                parent.pixel.height = height;
                parent.absoluteHeight = height;
                resize = true;
            }
            if (resize) {
                parent.computePadding();
                parent.computePositionX();
                parent.computePositionY();
                parent.updateAABB();
                if (parent.composite) {
                    parent.children.forEach(function(child) {
                        child.syncPosition();
                    });
                }
            }
        },

        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////

    });


    exports.BaseLayout = BaseLayout;

    if (typeof module !== "undefined") {
        module.exports = BaseLayout;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var VBoxLayout = Class.create({
        superclass: BaseLayout,

        initialize: function() {
            this.flexible = true;

            this.align = "top";
            this.size = null;
            this.equalSize = false;
        },

        compute: function(parent) {
            // console.log("compute.VBoxLayout", parent.id, parent.name || "");
            var children = parent.children;
            var childCount = children.length;
            if (childCount === 0) {
                return;
            }

            var idx = 0;
            var parentPixel = parent.pixel;
            var margin = parentPixel.paddingTop;
            var totalWidth = 0;
            var size = this.equalSize ? parentPixel.realOuterHeight / childCount : this.size;

            var alignBottom = !size && this.align === "bottom";

            var y = 0;
            var currentY = 0;
            for (var i = 0; i < childCount; i++) {
                var child = children[i];

                if (child.ignoreLayout !== true) {
                    if (child.follow) {
                        // y is same to previous
                    } else {
                        y = currentY;
                        if (size) {
                            y += child.pixel.marginTop;
                            currentY += size;
                        } else {
                            y += Math.max(margin, child.pixel.marginTop);
                            currentY = y + child._absoluteHeight;
                        }
                    }

                    child._movedY = true;
                    child.pixel.baseY = y;
                    if (!alignBottom) {
                        this.computeChild(child);
                    }

                    margin = child.pixel.marginBottom;
                    idx++;

                    var rightSpace = Math.max(parentPixel.paddingRight, child.pixel.marginRight);
                    totalWidth = Math.max(totalWidth, child.relativeX + child._absoluteWidth + rightSpace);
                    if (i + 1 === childCount) {
                        margin = Math.max(margin, parentPixel.paddingBottom)
                    }
                }
            }

            var totalHeight = size ? parent._absoluteHeight : currentY + margin;

            this.tryToResizeParent(parent, totalWidth, totalHeight);

            if (alignBottom) {
                var topSpace = parentPixel.height - totalHeight;
                for (var i = 0; i < childCount; i++) {
                    var child = children[i];
                    if (child.ignoreLayout !== true) {
                        child.pixel.baseY += topSpace;
                        this.computeChild(child);
                    }
                }
            }
            return idx;
        },

        computeChild: function(child) {
            child.syncPositionY();
            child.updateAABB();
            if (child.composite) {
                child.children.forEach(function(child) {
                    child.syncPosition();
                });
            }
        }
    });

    var properties = [

        {
            key: 'valign',
            get: function() {
                return this.align;
            },
            set: function(value) {
                this.align = value;
            }
        }

    ];

    Class.defineProperties(VBoxLayout.prototype, properties);

    exports.VBoxLayout = VBoxLayout;

    if (typeof module !== "undefined") {
        module.exports = VBoxLayout;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var HBoxLayout = Class.create({
        superclass: BaseLayout,

        initialize: function() {
            this.flexible = true;

            this.align = "left";
            this.size = null;
            this.equalSize = false;
        },

        compute: function(parent) {
            // console.log("compute.HBoxLayout", parent.id, parent.name || "");
            var children = parent.children;
            var childCount = children.length;
            if (childCount === 0) {
                return;
            }

            var idx = 0;
            var parentPixel = parent.pixel;
            var margin = parentPixel.paddingLeft;
            var totalHeight = 0;
            var size = this.equalSize ? parentPixel.realOuterHeight / childCount : this.size;

            var alignRight = !size && this.align === "right";

            var x = 0;
            var currentX = 0;
            for (var i = 0; i < childCount; i++) {
                var child = children[i];

                if (child.ignoreLayout !== true) {
                    if (child.follow) {
                        // x is same to previous
                    } else {
                        x = currentX;
                        if (size) {
                            x += child.pixel.marginLeft;
                            currentX += size;
                        } else {
                            x += Math.max(margin, child.pixel.marginLeft);
                            currentX = x + child._absoluteWidth;
                        }
                    }

                    child._movedX = true;
                    child.pixel.baseX = x;
                    if (!alignRight) {
                        this.computeChild(child);
                    }

                    margin = child.pixel.marginRight;
                    idx++;

                    var bottomSpace = Math.max(parentPixel.paddingBottom, child.pixel.marginBottom);
                    totalHeight = Math.max(totalHeight, child.relativeY + child._absoluteHeight + bottomSpace);

                    if (i + 1 === childCount) {
                        margin = Math.max(margin, parentPixel.paddingRight)
                    }
                }
            }

            var totalWidth = size ? parent._absoluteWidth : currentX + margin;

            this.tryToResizeParent(parent, totalWidth, totalHeight);

            if (alignRight) {
                var leftSpace = parentPixel.width - totalWidth;
                for (var i = 0; i < childCount; i++) {
                    var child = children[i];
                    if (child.ignoreLayout !== true) {
                        child.pixel.baseX += leftSpace;
                        this.computeChild(child);
                    }
                }
            }

            return idx;
        },

        computeChild: function(child) {
            child.syncPositionX();
            child.updateAABB();
            if (child.composite) {
                child.children.forEach(function(child) {
                    child.syncPosition();
                });
            }
        }

    });


    exports.HBoxLayout = HBoxLayout;

    if (typeof module !== "undefined") {
        module.exports = HBoxLayout;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var TableLayout = Class.create({
        superclass: BaseLayout,

        initialize: function() {
            this.flexible = false;

            this.cellWidth = null;
            this.cellHeight = null;

            this.cellSpaceH = null;
            this.cellSpaceV = null;

            this.cols = 1;
            this.rows = 1;
        },

        initTable: function(parent) {
            var pixel = this.pixel = {};
            var parentPixel = parent.pixel;

            var tableWidth = parentPixel.innerWidth;
            var tableHeight = parentPixel.innerHeight;

            pixel.cellSpace = Utils.parseValue(this.cellSpace, tableWidth) || 0;
            pixel.cellSpaceH = Utils.parseValue(this.cellSpaceH, tableWidth);
            pixel.cellSpaceV = Utils.parseValue(this.cellSpaceV, tableHeight);

            if (pixel.cellSpaceH === null) {
                pixel.cellSpaceH = pixel.cellSpace;
            }
            if (pixel.cellSpaceV === null) {
                pixel.cellSpaceV = pixel.cellSpace;
            }

            if (this.cellWidth) {
                pixel.cellWidth = Utils.parseValue(this.cellWidth, tableWidth);
                tableWidth = (pixel.cellWidth + pixel.cellSpaceH) * this.cols + pixel.cellSpaceH;
            } else {
                pixel.cellWidth = (tableWidth + pixel.cellSpaceH) / (this.cols || 1) - pixel.cellSpaceH >> 0;
            }
            if (this.cellHeight) {
                pixel.cellHeight = Utils.parseValue(this.cellHeight, tableHeight);
                tableHeight = (this.cellHeight + this.cellSpace) * this.rows + this.cellSpace;
            } else {
                pixel.cellHeight = (tableHeight + pixel.cellSpaceV) / (this.rows || 1) - pixel.cellSpaceV >> 0;
            }
            // tableWidth += pixel.cellSpaceH;
            // tableHeight += pixel.cellSpaceV;
            pixel.tableWidth = tableWidth;
            pixel.tableHeight = tableHeight;

            this.parentCell = {
                scrollX: parent.scrollX,
                scrollY: parent.scrollY,
                relativeX: 0,
                relativeY: 0,
                _absoluteX: 0,
                _absoluteY: 0,
                _absoluteWidth: 0,
                _absoluteHeight: 0,
                _offsetX: 0,
                _offsetY: 0,
                pixel: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    baseX: 0,
                    baseY: 0,
                    relativeX: 0,
                    relativeY: 0,
                    paddingLeft: 0,
                    paddingTop: 0,
                    paddingRight: 0,
                    paddingBottom: 0,
                }
            };
        },

        compute: function(parent) {
            // console.log("compute.TableLayout", parent.id, parent.name || "");
            var children = parent.children;
            var childCount = children.length;
            if (childCount === 0) {
                return;
            }

            var idx = 0;

            this.initTable(parent);

            for (var i = 0; i < childCount; i++) {
                var child = children[i];
                if (child.ignoreLayout !== true) {
                    this.parseChild(child, parent, idx);
                    idx++;
                }
            }

            if (childCount > 0) {
                this.tryToResizeParent(parent, parent._absoluteWidth, parent._absoluteHeight);
            }
            return idx;
        },

        parseChild: function(child, parent, index) {
            var col = child.col = child.col || 0;
            var row = child.row = child.row || 0;
            child.colspan = child.colspan || 1;
            child.rowspan = child.rowspan || 1;
            // child.width = child.width === null ? "100%" : child.width;
            // child.height = child.height === null ? "100%" : child.height;

            var pixel = child.pixel;

            // no cellSpace
            var w = this.pixel.cellWidth,
                h = this.pixel.cellHeight;

            var cellSpaceH = this.pixel.cellSpaceH;
            var cellSpaceV = this.pixel.cellSpaceV;

            var parentCell = this.parentCell;

            parentCell.pixel.x = parent.absoluteX;
            parentCell.pixel.y = parent.absoluteY;

            parentCell._absoluteX = parentCell.pixel.x;
            parentCell.absoluteX = parentCell._absoluteX;

            parentCell._absoluteY = parentCell.pixel.y;
            parentCell.absoluteY = parentCell._absoluteY;

            parentCell.pixel.width = child.colspan * (w + cellSpaceH) - cellSpaceH;
            parentCell.pixel.height = child.rowspan * (h + cellSpaceV) - cellSpaceV;

            parentCell._absoluteWidth = parentCell.pixel.width;
            parentCell.absoluteWidth = parentCell._absoluteWidth;

            parentCell._absoluteHeight = parentCell.pixel.height;
            parentCell.absoluteHeight = parentCell._absoluteHeight;

            child.computeMargin(parentCell);
            child.computeWidth();
            child.computeHeight();

            child._movedX = true;
            child.pixel.baseX = Math.max(child.marginLeft, parent.paddingLeft) + col * (w + cellSpaceH);

            child._movedY = true;
            child.pixel.baseY = Math.max(child.marginTop, parent.paddingTop) + row * (h + cellSpaceV);

            child.syncPosition(parentCell);
        },
    });


    exports.TableLayout = TableLayout;

    if (typeof module !== "undefined") {
        module.exports = TableLayout;
    }

}(CUI));

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;
    var VBoxLayout = exports.VBoxLayout;
    var HBoxLayout = exports.HBoxLayout;
    var TableLayout = exports.TableLayout;

    var Layout = Class.create({

        init: function() {

        }

    });

    Layout.commonLayout = new BaseLayout();
    // Layout.vBox = new VBoxLayout();
    // Layout.hBox = new HBoxLayout();
    // Layout.tableBox = new TableLayout({
    //
    // });

    exports.Layout = Layout;

    if (typeof module !== "undefined") {
        module.exports = Layout;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;
    var noop = exports.noop;

    var Composite = exports.Composite;
    var EventDispatcher = exports.EventDispatcher;
    var TouchTarget = exports.TouchTarget;
    var Layout = exports.Layout;

    var Component = Class.create({
        superclass: Core,

        initialize: function() {
            this.anchor = 0.5;

            this.left = null;
            this.top = null;
            this.right = null;
            this.bottom = null;

            this.inView = true;
            this.index = 0;

            this.scrollX = 0;
            this.scrollY = 0;

            this.extBound = null;
            this.extLeft = null;
            this.extRight = null;
            this.extTop = null;
            this.extBottom = null;

            this.layout = null;

            // true 为 空洞的, 不会阻挡后面组件响应触控事件
            this.hollow = false;

            this.modal = false;
            this.modalMaskColor = null;
            this.modalMaskAlpha = 0;
            this.modalMaskX = null;
            this.modalMaskY = null;
            this.modalMaskWidth = null;
            this.modalMaskHeight = null;

            this.clipArea = false;

            this.maskX = 0;
            this.maskY = 0;
            this.maskWidth = 0;
            this.maskHeight = 0;

            /////////////////////////////////////////////

            // 以下 5 个属性支持数字(代表像素), 和百分比
            // 百分比时, 相对参照物为 自身 的实际宽高(像素)
            this.padding = null;
            this.paddingTop = null;
            this.paddingRight = null;
            this.paddingBottom = null;
            this.paddingLeft = null;

            // 以下 5 个属性支持数字(代表像素), 和百分比
            // 百分比时, 相对参照物为 父元素 的实际宽高(像素)
            this.margin = null;
            this.marginTop = null;
            this.marginRight = null;
            this.marginBottom = null;
            this.marginLeft = null;

            this.ignoreLayout = false;

            this.backgroundColor = null; //"rgba(200,220,255,1)";
            this.backgroundAlpha = 1;
            this.backgroundImage = null;
            this.backgroundImageAlpha = 1;
            this.backgroundInfo = null;

            this.scaleBg = true;

            // this.borderColor = "rgba(30,50,80,1)";
            this.borderColor = null;
            this.borderAlpha = 1;
            this.borderWidth = 0;
            this.borderImageInfo = null; // { img , sx, sy, sw, sh, top, right, bottom, left }

            this.touchTarget = true;

            this.composite = true;
            this.children = null;
            this.childrenMap = null;

            this._movedX = false;
            this._movedY = false;
            this._toSortChildren = true;

            this._needToComputeChildren = true;
            this.reflowComputeTimes = 0;
        },

        initBase: function() {
            this.aabb = [0, 0, 0, 0];
            if (this.extBound !== null) {
                (this.extLeft === null) && (this.extLeft = this.extBound);
                (this.extRight === null) && (this.extRight = this.extBound);
                (this.extTop === null) && (this.extTop = this.extBound);
                (this.extBotom === null) && (this.extBotom = this.extBound);
            }
            this.extLeft = this.extLeft || 0;
            this.extRight = this.extRight || 0;
            this.extTop = this.extTop || 0;
            this.extBotom = this.extBotom || 0;

            this.holders = [];

            this._defaultAlpha = this.alpha;

            if (this.parent) {
                this.parent.addChild(this);
            }

            EventDispatcher.applyTo(this);

            if (this.touchTarget) {
                TouchTarget.applyTo(this);
            }

            if (this.composite) {
                this.all = {};
                Composite.applyTo(this);
                this.setLayout(this.layout);
                this.childSN = 0;
            }

            this.setMargin(this.margin || 0);
            this.setPadding(this.padding || 0);

            this.computeSelf();
            this.updateAABB();

            this.initDisplayObject();

            this.initModalMask();

            this.initBackgroundColor();
            this.initBorder();

            this.initBackgroundImage();
            this.initBorderImage();

            this.initHolders();

            this.savePreviousState();

            this.reflow();
        },

        init: function() {
            this.id = this.id || "comp_" + Core._SN++;

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.initBase();

            if (this.afterInit) {
                this.afterInit();
            }

            this.inited = true;
        },

        initDisplayObject: function() {
            var displayObject = this.root.renderer.createContainer();
            displayObject._ignoreResize = true;
            this.displayObject = displayObject;

            if (this.clipArea && this.maskWidth > 0 && this.maskHeight > 0) {
                var mh = this.maskHeight;
                this.maskHeight = 0;
                this.setMask(this.maskX, this.maskY, this.maskWidth, mh);
            }

            this.syncDisplayObject();
            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

        initHolders: noop,
        initChildren: noop,

        reflow: function() {
            this.reflowComputeTimes = 1;
        },

        resizeParents: function(parent) {
            var parent = parent || this.parent;
            while (parent) {
                if (parent.layout.flexible) {
                    parent._needToCompute = true;
                }
                if (parent.width === "auto" || parent.height === "auto") {
                    parent._needToCompute = true;
                    parent = parent.parent;
                } else {
                    break;
                }
            }
        },

        setDisabled: function(disabled) {
            this.disabled = disabled;
        },

        initModalMask: function() {
            var modalMaskColor = this.modalMaskColor || this.root.modalMaskColor;
            var modalMaskAlpha = this.modalMaskAlpha || this.root.modalMaskAlpha;

            if (!this.modal || modalMaskColor === null || modalMaskAlpha <= 0) {
                return;
            }

            var holder = new CUI.BackgroundHolder({
                parent: this,
                color: modalMaskColor,
                alpha: modalMaskAlpha,
                fillParent: false,
                left: 0,
                top: 0,
                width: this.modalMaskWidth || (this.root._absoluteWidth + 100),
                height: this.modalMaskHeight || (this.root._absoluteHeight + 100),
                alignH: "left",
                alignV: "top",
            });
            holder.init();

            this.modalMaskHolder = holder;
            this._needToCompute = true;
        },

        initBackgroundColor: function() {
            var color = this.backgroundColor;
            color = color === null || color === undefined ? this.bgColor : color;
            this.backgroundColor = color;
            if (color === null || color === undefined || color === false) {
                this.backgroundHolder = null;
                return;
            }
            this.setBackgroundColor(this.backgroundColor, this.backgroundAlpha);
        },
        setBackgroundColor: function(color, alpha) {
            var holder = this.backgroundHolder;
            if (holder) {
                // TODO
            } else {
                holder = new CUI.BackgroundHolder({
                    parent: this,
                    color: color,
                    alpha: alpha,
                    fillParent: true,
                });
                holder.init();
                this.backgroundHolder = holder;
            }

            this._needToCompute = true;
        },

        initBorder: function() {
            if (this.borderColor === null || this.borderWidth <= 0) {
                this.borderHolder = null;
                return;
            }
            var holder = new CUI.BorderHolder({
                parent: this,
                alpha: this.borderAlpha,
                lineWidth: this.borderWidth,
                color: this.borderColor,
            });
            holder.init();
            this.borderHolder = holder;
            this._needToCompute = true;
        },

        initBorderImage: function(info) {
            this.setBorderImage(this.borderImageInfo)
        },

        setBorderImage: function(info) {
            // TODO
            var insertIndex = null;
            if (this.borderImageHolder) {
                var displayObj = this.borderImageHolder.displayObject;
                insertIndex = displayObj.parent.getChildIndex(displayObj);
                displayObj.parent.removeChild(displayObj);
                // this.borderImageHolder.destroy();
                this.borderImageHolder = null;
                this._needToCompute = true;
            }
            if (!info) {
                return;
            }
            var holder = new CUI.BorderImageHolder(info);
            holder.insertIndex = insertIndex;
            holder.parent = this;
            holder.init();
            this.borderImageHolder = holder;
            this._needToCompute = true;
        },

        initBackgroundImage: function() {
            this.backgroundImage = this.backgroundImage || this.backgroundImg || this.bgImg;
            this.backgroundInfo = this.backgroundInfo || this.bgInfo || this.backgroundImageInfo || this.bgImgInfo;
            if (this.backgroundInfo) {
                var info = this.backgroundInfo;
                info.img = info.img || this.backgroundImage;
                if (!info.alpha && info.alpha !== 0) {
                    info.alpha = this.backgroundImageAlpha;
                }
                this.setBackgroundInfo(info);
            } else if (this.backgroundImage) {
                this.setBackgroundImage(this.backgroundImage);
            }
        },

        setBackgroundImage: function(image) {
            this.setBackgroundInfo({
                img: image
            });
        },

        setBackgroundInfo: function(info) {
            if (!info) {
                return;
            }
            var holder = this.backgroundImageHolder;
            if (holder) {
                holder.setImageInfo(info);
            } else {
                holder = new CUI.ImageHolder({
                    parent: this,
                    imageInfo: info,
                    fillParent: this.scaleBg,
                    lockScaleRatio: false,
                });
                holder.init();
                this.backgroundImageHolder = holder;
            }
            this._needToCompute = true;
        },


        addImageHolder: function(holderInfo) {
            var holder = new CUI.ImageHolder(holderInfo);
            holder.parent = this;
            holder.init();
            this.holders.push(holder);
            return holder;
        },

        addTextHolder: function(holderInfo) {
            var holder = new CUI.TextHolder(holderInfo);
            holder.parent = this;
            holder.init();
            this.holders.push(holder);
            return holder;
        },

        beforeInit: null,
        afterInit: null,

        _beforeInit: noop,
        _afterInit: noop,

        setLayout: function(layout) {
            var name, options;
            if (typeof layout === "string") {
                name = layout;
            } else if (layout && layout.constructor === Object) {
                var name = layout.name;
                options = layout;
            }
            if (name) {
                switch (name) {
                    case "vbox":
                        layout = new CUI.VBoxLayout(options);
                        break;
                    case "hbox":
                        layout = new CUI.HBoxLayout(options);
                        break;
                    case "table":
                        layout = new CUI.TableLayout(options);
                        break;
                    default:
                        layout = new CUI.BaseLayout(options);
                        break;
                }
            }
            if (!layout) {
                layout = Layout.commonLayout;
            }
            this.layout = layout;
        },

        setRoot: function(root) {
            if (!root) {
                if (this.root) {
                    delete this.root.all[this.id];
                    this.root = null;
                }
                return;
            }

            this.root = root;

            var _comp = root.all[this.id];
            if (_comp !== this) {
                root.all[this.id] = this;
                if (_comp) {
                    console.log("**** Duplicate id : " + this.id + " ****");
                }
            }
        },

        addChild: function(child) {
            if (this.composite) {
                Composite.prototype.addChild.call(this, child);
                child.index = this.childSN++;

                child.setRoot(this.root);

                // TODO
                if (this._width === "auto") {
                    this.pixel.width = 0;
                }
                if (this._height === "auto") {
                    this.pixel.height = 0;
                }
                if (this.layout.flexible) {

                }
                this._needToCompute = true;
                this._toSortChildren = true;
                // this.sortChildren();
            }
        },

        removeChild: function(child) {
            var removed = false;
            if (this.composite) {
                if (child.composite) {
                    child.removeAllChildren();
                }
                removed = Composite.prototype.removeChild.call(this, child);
                if (removed) {
                    if (this.root) {
                        delete this.root.all[child.id];
                    }
                    child.setRoot(null);

                    this.displayObject.removeChild(child.displayObject);

                    if (this._width === "auto") {
                        this.pixel.width = 0;
                    }
                    if (this._height === "auto") {
                        this.pixel.height = 0;
                    }
                    this._needToCompute = true;
                }
            }
            return removed;
        },

        sortChildren: function() {
            this.children.sort(function(a, b) {
                return a.zIndex - b.zIndex || a.index - b.index;
            });
            this.displayObject.sortChildren();
            this._toSortChildren = false;
        },

        setMargin: function(margin) {
            this.margin = margin;
            this.marginLeft = this.marginLeft === null ? this.margin : this.marginLeft;
            this.marginTop = this.marginTop === null ? this.margin : this.marginTop;
            this.marginRight = this.marginRight === null ? this.margin : this.marginRight;
            this.marginBottom = this.marginBottom === null ? this.margin : this.marginBottom;
        },

        setPadding: function(padding) {
            this.padding = padding;
            this.paddingLeft = this.paddingLeft === null ? this.padding : this.paddingLeft;
            this.paddingTop = this.paddingTop === null ? this.padding : this.paddingTop;
            this.paddingRight = this.paddingRight === null ? this.padding : this.paddingRight;
            this.paddingBottom = this.paddingBottom === null ? this.padding : this.paddingBottom;
        },

        syncMask: function() {
            this.setMask(0, 0, this._absoluteWidth, this._absoluteHeight);
        },

        setMask: function(x, y, width, height) {
            var maskShape = this.maskShape;
            // var pixel = this.pixel;
            // this.maskShape = this.root.renderer.updateRect(maskShape, 0, 0, pixel.innerWidth, pixel.innerHeight, 0x000000, 1);
            if (!maskShape || x !== this.maskX || y !== this.maskY || width !== this.maskWidth || height !== this.maskHeight) {
                this.maskX = x;
                this.maskY = y;
                this.maskWidth = width;
                this.maskHeight = height;
                this.maskShape = this.root.renderer.updateRect(maskShape, x, y, width, height, 0x000000, 1);
            }
            this.displayObject.mask = this.maskShape;
            if (!maskShape) {
                // TODO
                this.displayObject.addChild(this.maskShape);
            }
        },

        removeMask: function() {
            this.maskX = 0;
            this.maskY = 0;
            this.maskWidth = 0;
            this.maskHeight = 0;
            this.displayObject.mask = null;
            if (this.maskShape) {
                this.displayObject.removeChild(this.maskShape);
            }
        },

        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        //            以下方法在父元素已经init 并 至少计算过一次之后才可调用
        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////

        setPosition: function(left, top) {
            if (this.left !== left && left !== null) {
                this.left = left;
                this.computePositionX();
            }
            if (this.top !== top && top !== null && top !== undefined) {
                this.top = top;
                this.computePositionY();
            }
            this.updateAABB();
        },

        setSize: function(width, height, force) {
            if (force || this.width !== width) {
                this.width = width;
                this.computeWidth();
            }
            if (force || this.height !== height) {
                this.height = height;
                this.computeHeight();
            }
        },

        updateAABB: function() {
            this.aabb[0] = this._absoluteX - this.extLeft;
            this.aabb[1] = this._absoluteY - this.extTop;
            this.aabb[2] = this._absoluteX + this._absoluteWidth + this.extRight;
            this.aabb[3] = this._absoluteY + this._absoluteHeight + this.extBottom;
        },

        updateHolders: function() {
            if (this.modalMaskHolder) {
                var holder = this.modalMaskHolder;

                var rootWidth = this.root._absoluteWidth;
                var rootHeight = this.root._absoluteHeight;

                var modalMaskWidth = this.modalMaskWidth || rootWidth;
                var modalMaskHeight = this.modalMaskHeight || rootHeight;

                var fixX = 0;
                var fixY = 0;

                var mX = this.modalMaskX;
                if (!this.modalMaskX && this.modalMaskX !== 0) {
                    fixX = 10;
                    mX = -this._absoluteX + this.root._absoluteX - fixX;
                    mX += (rootWidth - modalMaskWidth) / 2;
                }
                var mY = this.modalMaskY;
                if (!this.modalMaskY && this.modalMaskY !== 0) {
                    fixY = 10;
                    mY = -this._absoluteY + this.root._absoluteY - fixY;
                    mY += (rootHeight - modalMaskHeight) / 2;
                }

                modalMaskWidth += fixX * 2;
                modalMaskHeight += fixY * 2;

                if (holder._left !== mX || holder._top !== mY) {
                    holder.left = mX;
                    holder.top = mY;
                }
                if (holder._width !== modalMaskWidth || holder._height !== modalMaskHeight) {
                    holder.width = modalMaskWidth;
                    holder.height = modalMaskHeight;
                }

                holder.update();
            }

            if (this.backgroundHolder) {
                this.backgroundHolder.update(this._sizeChanged);
            }

            if (this.borderHolder) {
                this.borderHolder.update(this._sizeChanged);
            }

            if (this.backgroundImageHolder) {
                this.backgroundImageHolder.update(this._sizeChanged);
            }

            if (this.borderImageHolder) {
                this.borderImageHolder.update(this._sizeChanged);
            }

            this.holders.forEach(function(holder) {
                if (holder) {
                    holder.update();
                }
            });
        },

        show: function(force) {
            if (this.visible && !force) {
                return false;
            }
            this.visible = true;
            this.onShow(force);
            this.reflow();
            return true;
        },
        onShow: noop,

        hide: function(force) {
            if (!this.visible && !force) {
                return false;
            }
            this.visible = false;
            this.onHide(force);
            this.reflow();
            return true;
        },
        onHide: noop,

        toggle: function() {
            if (this.visible) {
                return this.hide();
            }
            return this.show();
        },

        /////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////

        computeSelf: function() {
            // console.log('Component.computeSelf', this.id);
            // parent = parent || this.parent;
            this.computeMargin();
            this.computeWidth();
            this.computeHeight();
            this.computePadding();
            this.computePositionX();
            this.computePositionY();
        },

        compute: function() {
            this.computeSelf();
            if (this.layout) {
                this.layout.compute(this);
            }
            this.updateHolders();
            this.updateAABB();
        },

        getChildrenCount: function() {
            return this.composite ? this.children.length : 0;
        },

        isInView: function() {
            return this.checkCollideAABB(this.root.aabb);
        },

        isInRegion: function(x, y, width, height) {
            var aabb = this.aabb;
            return aabb[2] > x && aabb[3] > y && aabb[1] < (y + height) && aabb[0] < (x + width);

        },

        containPoint: function(x, y) {
            var aabb = this.aabb;
            return aabb[0] < x && x < aabb[2] && aabb[1] < y && y < aabb[3];
        },

        checkCollideAABB: function(aabb) {
            var aabb2 = this.aabb;
            return aabb[0] < aabb2[2] && aabb[2] > aabb2[0] && aabb[1] < aabb2[3] && aabb[3] > aabb2[1];
        },

        updateSelf: function(timeStep, now, forceCompute) {
            // do something
        },
        updateChildren: function(timeStep, now, forceCompute) {
            this.children.forEach(function(child) {
                child.update(timeStep, now, forceCompute);
            });
        },

        update: function(timeStep, now, forceCompute) {
            this.beforeUpdate && this.beforeUpdate(timeStep, now);

            this.updateSelf(timeStep, now, forceCompute);

            forceCompute = ((this.reflowComputeTimes--) > 0) || forceCompute;
            // this._sizeChanged = this._sizeChanged || forceCompute;
            // this._positionChanged = this._positionChanged || forceCompute;
            this._needToCompute = this._needToCompute || forceCompute;

            if (this.composite) {
                if (this._needToCompute && (this._width !== "auto" || this._height !== "auto")) {
                    this.computeSelf();
                }

                this._needToComputeChildren = this._needToComputeChildren || forceCompute;
                var forceComputeChildren = this._needToComputeChildren;

                if (this.visible || forceComputeChildren) {
                    this.updateChildren(timeStep, now, forceComputeChildren);
                    if (this._toSortChildren) {
                        this.sortChildren();
                    }
                }
            }

            if (this._needToCompute) {
                // console.log("compute of Component.", this.id);
                this.compute();
            }

            this.afterUpdate && this.afterUpdate(timeStep, now);

            this._sizeChanged = false;
            this._positionChanged = false;
            this._needToCompute = false;
            this._needToComputeChildren = false;
        },

        beforeUpdate: null,
        afterUpdate: null,

        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        computeMargin: function(parent) {
            parent = parent || this.parent;
            if (!parent) {
                return;
            }
            var parentPixel = parent.pixel;

            var pixel = this.pixel;
            this.marginLeft = this.marginLeft === null ? this.margin : this.marginLeft;
            this.marginTop = this.marginTop === null ? this.margin : this.marginTop;
            this.marginRight = this.marginRight === null ? this.margin : this.marginRight;
            this.marginBottom = this.marginBottom === null ? this.margin : this.marginBottom;

            pixel.marginLeft = Utils.parseValue(this.marginLeft, parentPixel.width) || 0;
            pixel.marginRight = Utils.parseValue(this.marginRight, parentPixel.width) || 0;
            pixel.marginTop = Utils.parseValue(this.marginTop, parentPixel.height) || 0;
            pixel.marginBottom = Utils.parseValue(this.marginBottom, parentPixel.height) || 0;

            pixel.realMarginLeft = Math.max(parentPixel.paddingLeft, pixel.marginLeft) || 0;
            pixel.realMarginTop = Math.max(parentPixel.paddingTop, pixel.marginTop) || 0;
            pixel.realMarginRight = Math.max(parentPixel.paddingRight, pixel.marginRight) || 0;
            pixel.realMarginBottom = Math.max(parentPixel.paddingBottom, pixel.marginBottom) || 0;

            pixel.realOuterWidth = parentPixel.width - pixel.realMarginLeft - pixel.realMarginRight;
            pixel.realOuterHeight = parentPixel.height - pixel.realMarginTop - pixel.realMarginBottom;
        },

        computePadding: function() {
            var pixel = this.pixel;
            this.paddingLeft = this.paddingLeft === null ? this.padding : this.paddingLeft;
            this.paddingTop = this.paddingTop === null ? this.padding : this.paddingTop;
            this.paddingRight = this.paddingRight === null ? this.padding : this.paddingRight;
            this.paddingBottom = this.paddingBottom === null ? this.padding : this.paddingBottom;

            pixel.paddingLeft = Utils.parseValue(this.paddingLeft, pixel.width) || 0;
            pixel.paddingRight = Utils.parseValue(this.paddingRight, pixel.width) || 0;
            pixel.paddingTop = Utils.parseValue(this.paddingTop, pixel.height) || 0;
            pixel.paddingBottom = Utils.parseValue(this.paddingBottom, pixel.height) || 0;

            pixel.innerWidth = pixel.width - pixel.paddingLeft - pixel.paddingRight;
            pixel.innerHeight = pixel.height - pixel.paddingTop - pixel.paddingBottom;
        },

        getFillWidth: function(relativeWidth) {
            if (this.left !== null && this.right !== null) {
                this.width = null;
                var _left;
                var _right;
                if (this._movedX) {
                    _left = this.pixel.left;
                    _right = this.pixel.right;
                } else {
                    _left = Utils.parseValue(this.left, relativeWidth);
                    _right = Utils.parseValue(this.right, relativeWidth);
                }
                return relativeWidth - _left - _right;
            }
            return null;
        },
        getFillHeight: function(relativeHeight) {
            if (this.top !== null && this.bottom !== null) {
                this.height = null;
                var _top;
                var _bottom;
                if (this._movedY) {
                    _top = this.pixel.top;
                    _bottom = this.pixel.bottom;
                } else {
                    _top = Utils.parseValue(this.top, relativeHeight);
                    _bottom = Utils.parseValue(this.bottom, relativeHeight);
                }
                return relativeHeight - _top - _bottom;
            }
            return null;
        },

        computeAutoWidth: function() {
            this.pixel.width = 0;
        },
        computeWidth: function() {
            if (this._resizedX) {
                return;
            }
            var pixel = this.pixel;
            if (this._width === "auto") {
                this.computeAutoWidth();
            } else {
                var relativeWidth = pixel.realOuterWidth;

                var fillWidth = this.getFillWidth(relativeWidth);
                if (fillWidth !== null) {
                    pixel.width = fillWidth;
                } else {
                    pixel.width = Utils.parseValue(this.width, relativeWidth);
                }
            }

            this.absoluteWidth = pixel.width;
        },

        computeAutoHeight: function() {
            this.pixel.height = 0;
        },
        computeHeight: function() {
            if (this._resizedY) {
                return;
            }
            var pixel = this.pixel;

            if (this._height === "auto") {
                this.computeAutoHeight();
            } else {
                var relativeHeight = pixel.realOuterHeight;
                var fillHeight = this.getFillHeight(relativeHeight);
                if (fillHeight !== null) {
                    pixel.height = fillHeight;
                } else {
                    pixel.height = Utils.parseValue(this.height, relativeHeight);
                }
            }

            this.absoluteHeight = pixel.height;
        },

        computePositionX: function(parent) {
            if (this._movedX) {
                return;
            }
            var pixel = this.pixel;
            var relativeWidth = pixel.realOuterWidth;

            var x = 0;
            pixel.left = Utils.parseValue(this.left, relativeWidth);
            pixel.right = Utils.parseValue(this.right, relativeWidth);
            if (this.alignH === "center") {
                x = (relativeWidth - pixel.width) / 2 + (pixel.left || 0);
            } else if (this.alignH === "right") {
                x = (relativeWidth - pixel.width) + (pixel.left || 0);
            } else if (pixel.left === null && pixel.right !== null) {
                x = (relativeWidth - pixel.width) - (pixel.right || 0);
            } else {
                x = pixel.left || 0;
            }
            pixel.baseX = x + pixel.realMarginLeft;

            this.syncPositionX(parent);
        },

        computePositionY: function(parent) {
            if (this._movedY) {
                return;
            }
            var pixel = this.pixel;
            var relativeHeight = pixel.realOuterHeight;
            var y = 0;
            pixel.top = Utils.parseValue(this.top, relativeHeight);
            pixel.bottom = Utils.parseValue(this.bottom, relativeHeight);
            if (this.alignV === "center" || this.alignV === "middle") {
                y = (relativeHeight - pixel.height) / 2 + (pixel.top || 0);
            } else if (this.alignV === "bottom") {
                y = (relativeHeight - pixel.height) + (pixel.top || 0);
            } else if (pixel.top === null && pixel.bottom !== null) {
                y = (relativeHeight - pixel.height) - (pixel.bottom || 0);
            } else {
                y = pixel.top || 0;
            }
            pixel.baseY = y + pixel.realMarginTop;

            this.syncPositionY(parent);
        },

        syncPositionX: function(parent) {
            parent = parent || this.parent;
            var pixel = this.pixel;
            pixel.relativeX = pixel.baseX + this._offsetX - (parent ? parent.scrollX : 0);
            pixel.x = pixel.relativeX + (parent ? parent._absoluteX : 0);
            this.relativeX = pixel.relativeX;
            this.absoluteX = pixel.x;
        },

        syncPositionY: function(parent) {
            parent = parent || this.parent;
            var pixel = this.pixel;
            pixel.relativeY = pixel.baseY + this._offsetY - (parent ? parent.scrollY : 0);
            pixel.y = pixel.relativeY + (parent ? parent._absoluteY : 0);
            this.relativeY = pixel.relativeY;
            this.absoluteY = pixel.y;
        },

        syncPosition: function(parent) {
            parent = parent || this.parent;
            this.syncPositionX(parent);
            this.syncPositionY(parent);

            this.updateAABB();

            if (this.composite) {
                this.children.forEach(function(child) {
                    child.syncPosition();
                });
            }
        },

        syncDisplayWidth: function() {
            this._displayWidth = this._absoluteWidth * this._scaleX;
            this._pivotX = this._absoluteWidth * this._anchorX;
            if (this.displayObject) {
                this.displayObject.pivot.x = this._pivotX;
                this.displayObject.position.x = this.relativeX + this._pivotX;
                this.displayObject.scale.x = this._scaleX * (this._flipX ? -1 : 1);
            }
        },

        syncDisplayHeight: function() {
            this._displayHeight = this._absoluteHeight * this._scaleY;
            this._pivotY = this._absoluteHeight * this._anchorY;
            if (this.displayObject) {
                this.displayObject.pivot.y = this._pivotY;
                this.displayObject.position.y = this.relativeY + this._pivotY;
                this.displayObject.scale.y = this._scaleY * (this._flipY ? -1 : 1);
            }
        },

        resetPosition: function() {
            this._movedX = false;
            this._movedY = false;
            this.computePositionX();
            this.computePositionY();
        },

        // absolute == true 时, x/y 为 全局绝对位置
        moveTo: function(x, y, absolute) {
            var parent = this.parent;
            var pixel = this.pixel;

            var movedX = false;
            if (x !== null) {
                if (absolute === true && pixel.x !== x) {
                    pixel.x = x;
                    pixel.relativeX = x - (parent ? parent._absoluteX : 0);
                    pixel.baseX = pixel.relativeX - (this._offsetX - (parent ? parent.scrollX : 0));
                    movedX = true;
                } else if (absolute !== true && pixel.relativeX !== x) {
                    pixel.relativeX = x;
                    pixel.baseX = x - (this._offsetX - (parent ? parent.scrollX : 0));
                    x = pixel.x = x + (parent ? parent._absoluteX : 0);
                    movedX = true;
                }
                if (movedX) {
                    pixel.left = pixel.relativeX;
                    pixel.right = pixel.relativeX + pixel.width;
                    this._movedX = true;
                    this.relativeX = pixel.relativeX;
                    this.absoluteX = x;
                }
            }

            var movedY = false;
            if (y !== null) {
                if (absolute === true && pixel.y !== y) {
                    pixel.y = y;
                    pixel.relativeY = y - (parent ? parent._absoluteY : 0);
                    pixel.baseY = pixel.relativeY - (this._offsetY - (parent ? parent.scrollY : 0));
                    movedY = true;
                } else if (absolute !== true && pixel.relativeY !== y) {
                    pixel.relativeY = y;
                    pixel.baseY = y - (this._offsetY - (parent ? parent.scrollY : 0));
                    y = pixel.y = y + (parent ? parent._absoluteY : 0);
                    movedY = true;
                }
                if (movedY) {
                    pixel.top = pixel.relativeY;
                    pixel.bottom = pixel.top + pixel.height;
                    this._movedY = true;
                    this.relativeY = pixel.relativeY;
                    this.absoluteY = y;
                }
            }

            if (movedX || movedY) {
                // this.updateAABB();
                // if (this.composite) {
                //     this.children.forEach(function(child) {
                //         child.syncPosition();
                //     });
                // }
                this._needToCompute = true;
                this._needToComputeChildren = true;
            }
        },

        moveToX: function(x, absolute) {
            this.moveTo(x, null, absolute);
        },

        moveToY: function(y, absolute) {
            this.moveTo(null, y, absolute);
        },

        // 无所谓全局还是本地坐标
        moveBy: function(dx, dy) {
            if (dx && dy) {
                this.moveTo(this.pixel.x + dx, this.pixel.y + dy, true);
            } else if (dx) {
                this.moveTo(this.pixel.x + dx, null, true);
            } else if (dy) {
                this.moveTo(null, this.pixel.y + dy, true);
            }
        },

        resizeTo: function(width, height) {
            var pixel = this.pixel;

            var rasizedW = false;
            if (width !== null && this._absoluteWidth !== width) {
                pixel.width = width;
                this.absoluteWidth = pixel.width;
                this._resizedX = true;
                rasizedW = true;
            }

            var rasizedH = false;
            if (height !== null && this._absoluteHeight !== height) {
                pixel.height = height;
                this.absoluteHeight = pixel.height;
                this._resizedY = true;
                rasizedH = true;
            }

            if (rasizedW || rasizedH) {
                // this.updateAABB();

                // if (this.composite) {
                //     this.children.forEach(function(child) {
                //         child.syncPosition();
                //     });
                // }
                this._needToCompute = true;
                this._needToComputeChildren = true;
            }
        },

        resizeBy: function(deltaWidth, deltaHeight) {
            this.resizeTo(this._absoluteWidth + deltaWidth, this._absoluteHeight + deltaHeight);
        },

        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        destroy: function() {
            // TODO

            // 不会自动显式的销毁子元素. (不会调用子元素的destructor)
            if (this.composite) {
                this.children.forEach(function(child) {
                    child.parent = null;
                    child.root = null;
                });
                this.children = null;
                this.childrenMap = null;
            }

            this.holders.forEach(function(holders) {
                holders.destroy();
                holders.parent = null;
            });

            if (this.root) {
                delete this.root.all[this.id];
                this.root = null;
            }
            this.parent = null;
            this.layout = null;

            this.displayObject.destroy()
            this.displayObject = null;
        },
    });

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    var properties = [
        // TODO
    ];

    Class.defineProperties(Component.prototype, properties);

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    Component.create = function(options, parent) {
        var ui = options.ui;
        var children = options.children;
        delete options.ui;
        delete options.children;

        options.parent = parent;

        var comp = new ui(options);

        if (children) {
            children.forEach(function(child) {
                Component.create(child, comp);
            });
        }
        return comp;
    };

    exports.Component = Component;

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Composite = exports.Composite;
    var Component = exports.Component;
    var noop = exports.noop;

    var Root = Class.create({
        superclass: Component,

        initialize: function() {
            this.renderer = null;

            this.left = null;
            this.top = null;
            this.originalX = 0;
            this.originalY = 0;
        },

        updateSelf: noop,
        checkTouchSelf: noop,

        init: function() {
            this.id = this.id || "root_" + Core._SN++;

            this.root = this;

            if (this.left === null) {
                this.left = this.originalX;
            }
            if (this.top === null) {
                this.top = this.originalY;
            }

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.left = this.left || 0;
            this.top = this.top || 0;

            this.initBase();

            this.initChildren();

            this._toSortChildren = true;

            if (this.afterInit) {
                this.afterInit();
            }
        },

        compute: function() {
            this.computeSelf();
            this.layout.compute(this);
            this.updateHolders();
            this.updateAABB();
        },

        checkTouch: function(type, args) {
            if (this.disabled || !this.visible || this.alpha <= 0) {
                return false;
            }
            var rs = this.checkTouchChildren(arguments);
            if (rs !== false) {
                return rs;
            }
        },

    });


    exports.Root = Root;


}(CUI));

"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var BaseHolder = Class.create({
        superclass: Core,

        initialize: function() {

            this.lazyInit = true;

            this.alignH = "center";
            this.alignV = "center";

            // TODO
            this.offsetAlpha = 0;
            this.offsetWidth = 0;
            this.offsetHeight = 0;

            this.fillParent = false;

            this.ratio = null;
            this.lockScaleRatio = true;
        },

        init: function() {
            this.initDisplayObject();
            // this.updateSize();
            // this.updatePosition();
        },

        computeAutoWidth: function() {
            this.pixel.width = 0;
        },
        computeWidth: function() {
            var parent = this.parent;
            if (this._width === "auto") {
                this.computeAutoWidth();
            } else {
                this.pixel.width = Utils.parseValue(this.width, parent._absoluteWidth, this.pixel.width) || 0;
            }
            this.absoluteWidth = this.pixel.width;
        },

        computeAutoHeight: function() {
            this.pixel.height = 0;
        },
        computeHeight: function() {
            var parent = this.parent;
            if (this._height === "auto") {
                this.computeAutoHeight();
            } else {
                this.pixel.height = Utils.parseValue(this.height, parent._absoluteHeight, this.pixel.height) || 0;
            }
            this.absoluteHeight = this.pixel.height;
        },

        updateSize: function() {
            this.computeWidth();
            this.computeHeight();
            this._sizeChanged = true;
        },

        computePositionX: function(parent) {
            parent = parent || this.parent;

            var pixel = this.pixel;
            var relativeWidth = parent._absoluteWidth;

            var x = 0;
            pixel.left = Utils.parseValue(this.left, relativeWidth);
            pixel.right = Utils.parseValue(this.right, relativeWidth);
            if (this.alignH === "center") {
                x = (relativeWidth - this._displayWidth) / 2 + (pixel.left || 0);
            } else if (this.alignH === "right") {
                x = (relativeWidth - parent.pixel.paddingRight - this._displayWidth) + (pixel.left || 0);
            } else if (pixel.left === null && pixel.right !== null) {
                x = (relativeWidth - parent.pixel.paddingRight - this._displayWidth) - (pixel.right || 0);
            } else {
                x = parent.pixel.paddingLeft + (pixel.left || 0);
            }
            pixel.baseX = x;

            this.syncPositionX(parent);
        },

        computePositionY: function(parent) {
            parent = parent || this.parent;

            var pixel = this.pixel;
            var relativeHeight = parent._absoluteHeight;

            var y = 0;
            pixel.top = Utils.parseValue(this.top, relativeHeight);
            pixel.bottom = Utils.parseValue(this.bottom, relativeHeight);
            if (this.alignV === "center" || this.alignV === "middle") {
                y = (relativeHeight - this._displayHeight) / 2 + (pixel.top || 0);
            } else if (this.alignV === "bottom") {
                y = (relativeHeight - parent.pixel.paddingBottom - this._displayHeight) + (pixel.top || 0);
            } else if (pixel.top === null && pixel.bottom !== null) {
                y = (relativeHeight - parent.pixel.paddingBottom - this._displayHeight) - (pixel.bottom || 0);
            } else {
                y = parent.pixel.paddingTop + (pixel.top || 0);
            }
            pixel.baseY = y;

            this.syncPositionY(parent);
        },

        syncPositionX: function(parent) {
            parent = parent || this.parent;
            var pixel = this.pixel;
            pixel.relativeX = pixel.baseX + this._offsetX;
            pixel.x = pixel.relativeX + (parent ? parent._absoluteX : 0);
            this.relativeX = pixel.relativeX;
            this.absoluteX = pixel.x;
        },

        syncPositionY: function(parent) {
            parent = parent || this.parent;
            var pixel = this.pixel;
            pixel.relativeY = pixel.baseY + this._offsetY;
            pixel.y = pixel.relativeY + (parent ? parent._absoluteY : 0);
            this.relativeY = pixel.relativeY;
            this.absoluteY = pixel.y;
        },

        updatePosition: function() {
            var parent = this.parent;
            if (!parent) {
                return;
            }
            this.computePositionX(parent);
            this.computePositionY(parent);
        },

        update: function(forceCompute) {
            if (this._sizeChanged || this._positionChanged || this._needToCompute || forceCompute) {
                this.updateSize();
                this.updatePosition();

                this._sizeChanged = false;
                this._positionChanged = false;
                this._needToCompute = false;
            }
        },

        syncDisplayWidth: function() {
            this._displayWidth = this._absoluteWidth * this._scaleX;
            this._pivotX = this._displayWidth * this._anchorX;
            if (this.displayObject) {
                if (!this.displayObject._ignoreResize) {
                    this.displayObject.width = this._displayWidth * (this._flipX ? -1 : 1);
                }
                this.displayObject._flipX = this._flipX;
                this.displayObject.pivot.x = this._pivotX / Math.abs(this.displayObject.scale.x);
                this.displayObject.position.x = this.relativeX + this._pivotX;
            }
        },
        syncDisplayHeight: function() {
            this._displayHeight = this._absoluteHeight * this._scaleY;
            this._pivotY = this._displayHeight * this._anchorY;
            if (this.displayObject) {
                if (!this.displayObject._ignoreResize) {
                    this.displayObject.height = this._displayHeight * (this._flipY ? -1 : 1);
                }
                this.displayObject._flipY = this._flipY;
                this.displayObject.pivot.y = this._pivotY / Math.abs(this.displayObject.scale.y);
                this.displayObject.position.y = this.relativeY + this._pivotY;
            }
        },
        destroy: function() {
            // TODO
            this.parent = null;
            this.displayObject.destroy();
            this.displayObject = null;
        }
    });

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////


    exports.BaseHolder = BaseHolder;

    if (typeof module !== "undefined") {
        module.exports = BaseHolder;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;
    var BaseHolder = exports.BaseHolder;
    var Font = exports.Font;

    var TextHolder = Class.create({
        superclass: BaseHolder,

        initialize: function() {
            this.text = null;
            this.color = "#000000";

            // "start", "end", "left", "right", "center",
            this.textAlign = "start";
            this.verticalAlign = "middle";

            this.width = "auto";
            this.height = "auto";
            this.alignH = null;
            this.alignV = null;

            // top 默认。文本基线是 em 方框的顶端。。
            // alphabetic  文本基线是普通的字母基线。
            // hanging 文本基线是悬挂基线。
            // middle  文本基线是 em 方框的正中。
            // ideographic 文本基线是表意基线。
            // bottom  文本基线是 em 方框的底端。
            this.textBaseline = "top";

            // "butt", "round", "square"
            this.lineCap = "butt";
            // "miter", "round", "bevel"
            this.lineJoin = "round";
            // miterLimit = strokeWidth

            this.strokeColor = null;
            this.strokeWidth = 1;

            this.fontStyle = null;
            this.fontWeight = null;
            this.fontSize = 14;
            this.fontName = "Arial";
            this.lineHeight = null;

            this.lines = null;
            this.lineCount = 1;

            this.shadowColor = null;
            this.shadowBlur = 0;
            this.shadowOffsetX = 0;
            this.shadowOffsetY = 0;

            this.measure = null;
            this.textWidth = 0;
            this.textHeight = 0;

            this.areaWidth = 0;
            this.areaHeight = 0;
            this.areaOffsetX = 0;
            this.areaOffsetY = 0;

            this.cachePadding = 2;
            this.useCache = null;
            this.useCachePool = true;

            this.linkCache = null;

            this.lineHeight = 0;
        },

        init: function() {

            this.id = this.id || "text-holder-" + this.parent.id;

            if (this.linkCache) {
                this.useCache = true;
            }

            this.setTextInfo(this);

            this.initDisplayObject();

            this.updateText();
            // this.updateSize();
            // this.updatePosition();
        },

        createCache: function() {
            if (!this.cacheCanvas) {
                if (this.useCachePool) {
                    this.cacheCanvas = Core.getCanvasFromPool(this.id);
                } else {
                    this.cacheCanvas = document.createElement("canvas");
                }
            }
            // document.body.appendChild(this.cacheCanvas)
            this.cacheContext = this.cacheCanvas.getContext('2d');
        },

        initDisplayObject: function() {
            if (this.useCache === true || !this.parent.root.renderer.canvas2d) {
                this._displayOffsetX = -this.cachePadding;
                this._displayOffsetY = -this.cachePadding;

                if (this.linkCache) {
                    this.displayObject = this.parent.root.renderer.createSprite(this.linkCache);
                } else {
                    this.createCache();
                    this.displayObject = this.parent.root.renderer.createTextObject(this.cacheContext);
                }
            } else {
                this.displayObject = this.parent.root.renderer.createTextObject();
                this.displayObject.textInfo = this;
            }
            this.syncDisplayObject();

            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

        setTextInfo: function(info) {
            if (info.alignH) {
                this.alignH = info.alignH;
            } else {
                this.alignH = info.textAlign || this.textAlign;
            }
            if (info.alignV) {
                this.alignV = info.alignV;
            } else {
                this.alignV = info.verticalAlign || this.verticalAlign;
            }

            this.setText(info.text);
            // this.fontName = Font.getName(info.fontName || this.fontName);
            this.color = info.color || this.color;
            this.fontName = info.fontName || this.fontName;
            this.fontSize = info.fontSize || this.fontSize;
            this.fontWeight = info.fontWeight;
            this.fontStyle = Font.getStyle(this.fontSize, this.fontName, this.fontWeight);
        },
        setFontName: function(fontName) {
            this.fontName = fontName;
            this.fontStyle = Font.getStyle(this.fontSize, this.fontName, this.fontWeight);
        },
        setFontSize: function(fontSize) {
            this.fontSize = fontSize;
            this.fontStyle = Font.getStyle(this.fontSize, this.fontName, this.fontWeight);
        },
        setFontWeight: function(fontWeight) {
            this.fontWeight = fontWeight;
            this.fontStyle = Font.getStyle(this.fontSize, this.fontName, this.fontWeight);
        },

        setColor: function(color) {
            if (this.color === color) {
                return;
            }
            this.color = color;
            this._needToCompute = true;
        },

        setShadowOffset: function(x, y) {
            if (this.shadowOffsetX === x && this.shadowOffsetY === y) {
                return;
            }
            this.shadowOffsetX = x;
            this.shadowOffsetY = y;
            this._needToCompute = true;
        },

        setText: function(text) {
            this.textChanged = this._text !== text;
            if (!this.textChanged) {
                return;
            }
            this._text = text;
            text = this.text = text === null || text === undefined ? "" : text;
            if (Array.isArray(text)) {
                this.lines = text;
            } else {
                this.lines = String(text).split(/(?:\r\n|\r|\n)/);
            }
            this.lineCount = this.lines.length;
            this._needToCompute = true;
        },

        updateText: function() {
            if (!this.lines) {
                // this._needToCompute = false;
                return;
            }

            if (!this.lineHeight) {
                this.lineHeight = Math.ceil(this.fontSize * 1.25) + (this.strokeWidth || 1) + 2;
            }

            // if (this._width === "auto" || this._height === "auto") {
            if (this._width === "auto") {
                var measure = CUI.Utils.measureText(this.lines, this.fontStyle);
                this.measure = measure || {
                    width: 0,
                };
            } else {
                this.measure = {
                    width: this._width,
                }
            }

            if (this._height === "auto") {
                this.measure.height = this.lineHeight * this.lineCount;
            } else {
                this.measure.height = this._height;
            }

            this.textWidth = this.measure.width;
            this.textHeight = this.measure.height;

            this.updateArea();

            this._needToCompute = true;
        },

        updateArea: function() {
            if (this.linkCache) {
                this.areaWidth = this.linkCache.width;
                this.areaHeight = this.linkCache.height;
                return;
            }

            this.areaWidth = this.textWidth + this.strokeWidth; // * 2;
            this.areaHeight = this.textHeight + this.strokeWidth; // * 2;
            // debugger
            if (this.useCache === true || !this.parent.root.renderer.canvas2d) {
                this.areaWidth += this.cachePadding * 2;
                this.areaHeight += this.cachePadding * 2;

                // this.areaOffsetX = this.cachePadding;
                // this.areaOffsetY = this.cachePadding;

                if (this.alignH === "center") {
                    this.areaOffsetX = Math.ceil(this.areaWidth / 2);
                } else if (this.alignH === "right" || this.alignH === "end") {
                    this.areaOffsetX = this.cachePadding + this.textWidth;
                } else {
                    this.areaOffsetX = this.cachePadding;
                }

                // this.areaOffsetX += this.strokeWidth / 2;
                // this.areaOffsetY += this.strokeWidth / 2;

                this.cacheCanvas.width = this.areaWidth;
                this.cacheCanvas.height = this.areaHeight;

                CUI.Utils.renderTextContent(this.cacheContext, this, this.areaOffsetX, this.areaOffsetY, true);

                // TEST
                // this.cacheContext.strokeStyle = "#ff00ff";
                // this.cacheContext.lineWidth = 8;
                // this.cacheContext.strokeRect(0, 0, this.areaWidth, this.areaHeight);
            }

            this.displayObject.updateSize();
            // this.displayObject.updateContent();
        },

        computeWidth: function() {
            this.pixel.width = this.areaWidth;
            this.absoluteWidth = this.areaWidth;
        },
        computeHeight: function() {
            this.pixel.height = this.areaHeight;
            this.absoluteHeight = this.areaHeight;
        },

        update: function(forceCompute) {
            if (this._sizeChanged || this._positionChanged || this._needToCompute || forceCompute) {
                this.updateSize();
                this.updatePosition();

                this._sizeChanged = false;
                this._positionChanged = false;
                this._needToCompute = false;
            }
        },
    });

    exports.TextHolder = TextHolder;

    if (typeof module !== "undefined") {
        module.exports = TextHolder;
    }

}(CUI));

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

            this.anchor = 0.5;

            this.src = null;
            this.img = null;
            this.sx = null;
            this.sy = null;
            this.sw = null;
            this.sh = null;

            // auto: 显示大小等于 图片实际大小;
            this.width = "auto";
            this.height = "auto";

            this.fillParent = false;

            this.ratio = null;
            this.lockScaleRatio = true;

            this.crossOrigin = 'anonymous';

            this.tint = null;

            this.config = {};
        },

        init: function() {
            this.id = this.id || "text-holder-" + this.parent.id;

            this.initDisplayObject();

            if (this.imageInfo) {
                var info = this.imageInfo;
                info.img = info.img || this.img;
                info.src = info.src || this.src;
                this.setImageInfo(info);
            } else if (this.src) {
                this.load(this.src);
            } else if (this.img) {
                this.setImg(this.img);
            }

            // this.updateSize();
            // this.updatePosition();
        },

        load: function(callback) {
            this.setSrc(this.src, callback);
        },

        setSrc: function(src, callback) {
            if (!src) {
                this.setImg(null, callback);
                return;
            }
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

        setImg: function(img, callback) {
            this.img = img;
            this.updateImageInfo();
            if (callback) {
                callback(img);
            }
        },

        setImageInfo: function(info) {
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

        updateImageInfo: function(info) {
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

            this.config.sx = sx;
            this.config.sy = sy;
            this.config.sw = sw;
            this.config.sh = sh;
            this.config.ox = ox;
            this.config.oy = oy;
            this.config.w = w;
            this.config.h = h;

            this.updateDisplayObject();

            this.pixel.width = w;
            this.pixel.height = h;
            this.absoluteWidth = w;
            this.absoluteHeight = h;

            this.ratio = w / h;
        },

        initDisplayObject: function() {
            var displayObject = this.parent.root.renderer.createSprite();
            this.displayObject = displayObject;
            this.syncDisplayObject();
            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

        updateDisplayObject: function() {
            if (!this.img) {
                // this.displayObject = null;
                return;
            }
            var config = this.config;
            this.parent.root.renderer.updateSprite(this.displayObject, config.sx, config.sy, config.sw, config.sh, this.img);
            this.displayObject.tint = this.tint === null ? 0xFFFFFF : this.tint;
        },

        computeAutoWidth: function() {
            this.pixel.width = this.config.w;
        },

        computeAutoHeight: function() {
            this.pixel.height = this.config.h;
        },

        updatePosition: function() {
            var parent = this.parent;
            if (!parent) {
                return;
            }
            var pixel = this.pixel;

            if (this.fillParent) {
                if (this.ratio !== null && this.lockScaleRatio) {
                    pixel.baseX = (parent._absoluteWidth - this._absoluteWidth) / 2;
                    pixel.baseY = (parent._absoluteHeight - this._absoluteHeight) / 2;
                } else {
                    pixel.baseX = 0;
                    pixel.baseY = 0;
                }
                this.syncPositionX(parent);
                this.syncPositionY(parent);
                return;
            }

            this.computePositionX(parent);
            this.computePositionY(parent);
        },

        updateSize: function() {

            if (this.fillParent) {
                var parent = this.parent;

                var width = parent._absoluteWidth;
                var height = parent._absoluteHeight;

                if (this.ratio !== null && this.lockScaleRatio) {
                    // debugger;
                    var _r = width / height;
                    if (_r >= this.ratio) {
                        width = height * this.ratio;
                    } else {
                        height = width / this.ratio;
                    }
                }

                this.pixel.width = width;
                this.pixel.height = height;
                this.absoluteWidth = width;
                this.absoluteHeight = height;

                this._sizeChanged = true;
                return;
            }

            this.computeWidth();
            this.computeHeight();

            this._sizeChanged = true;
        },

        removeImg: function() {
            this.img = null;
            this.displayObject = null;
            // this.src = null;
        },

    });


    exports.ImageHolder = ImageHolder;

    if (typeof module !== "undefined") {
        module.exports = ImageHolder;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {
    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseHolder = exports.BaseHolder;

    var BackgroundHolder = Class.create({
        superclass: BaseHolder,

        initialize: function() {
            this.width = "100%";
            this.height = "100%";

            this.color = null;
            this.alpha = 1;

            this.fillParent = true;
        },

        initDisplayObject: function() {
            var displayObject = this.parent.root.renderer.createRect(this.absoluteWidth, this.absoluteHeight, this.color, this.alpha);
            this.displayObject = displayObject;
            this.syncDisplayObject();
            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

        update: function(forceCompute) {
            if (this.parent._sizeChanged || this._sizeChanged || this._positionChanged || this._needToCompute || forceCompute) {
                this.updateSize();
                this.updatePosition();

                this.parent.root.renderer.updateRect(this.displayObject, 0, 0, this.absoluteWidth, this.absoluteHeight, this.color, this.alpha);

                this._sizeChanged = false;
                this._positionChanged = false;
                this._needToCompute = false;
            }
        },
    });


    exports.BackgroundHolder = BackgroundHolder;

    if (typeof module !== "undefined") {
        module.exports = BackgroundHolder;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {
    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseHolder = exports.BaseHolder;

    var BorderHolder = Class.create({
        superclass: BaseHolder,

        initialize: function() {
            this.width = "100%";
            this.height = "100%";

            this.fillParent = true;

            this.color = null;
            this.alpha = 1;
            this.lineWidth = 1;
        },

        initDisplayObject: function() {
            var displayObject = this.parent.root.renderer.createRect(this.absoluteWidth, this.absoluteHeight, null, null, this.lineWidth, this.color, this.alpha);
            this.displayObject = displayObject;
            this.syncDisplayObject();

            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

        update: function(forceCompute) {
            if (this.parent._sizeChanged || this._sizeChanged || this._positionChanged || this._needToCompute || forceCompute) {
                this.updateSize();
                this.updatePosition();

                this.parent.root.renderer.updateRect(this.displayObject, 0, 0, this.absoluteWidth, this.absoluteHeight, null, null, this.lineWidth, this.color, this.alpha);

                this._sizeChanged = false;
                this._positionChanged = false;
                this._needToCompute = false;
            }
        },
    });


    exports.BorderHolder = BorderHolder;

    if (typeof module !== "undefined") {
        module.exports = BorderHolder;
    }

}(CUI));

"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var BaseHolder = exports.BaseHolder;

    var BorderImageHolder = Class.create({
        superclass: BaseHolder,

        initialize: function() {
            this.width = "100%";
            this.height = "100%";

            this.borderImage = true;

            this.T = null;
            this.R = null;
            this.B = null;
            this.L = null;

            this.alpha = 1;
            this.fillParent = true;
        },

        init: function() {
            this.config = {
                sx: this.sx,
                sy: this.sy,
                sw: this.sw,
                sh: this.sh,
            };

            this.initDisplayObject();
            // this.updateSize();
            // this.updatePosition();
        },

        initDisplayObject: function() {
            var img = this.img;
            var config = this.config;
            var sx = config.sx || 0;
            var sy = config.sy || 0;
            var sw = config.sw || img.width;
            var sh = config.sh || img.height;

            var L = this.L;
            var T = this.T;
            var R = this.R;
            var B = this.B;

            this.displayObject = this.parent.root.renderer.createNineSlicePlane(img, sx, sy, sw, sh, L, T, R, B);
            this.syncDisplayObject();

            this.displayObject.width = sw;
            this.displayObject.height = sh;

            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
        },

    });


    exports.BorderImageHolder = BorderImageHolder;

    if (typeof module !== "undefined") {
        module.exports = BorderImageHolder;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;

    var Blank = Class.create({
        superclass: Component,

        initialize: function() {
            this.composite = false;
            this.disabled = false;
            this.backgroundColor = null;
        },

        compute: function() {
            this.computeSelf();
            if (this.backgroundHolder) {
                this.backgroundHolder.update(this._sizeChanged);
            }
            this.updateAABB();
        },
    });

    Blank.create = function(width, height, parent) {
        var comp = new CUI.Blank({
            parent: parent,
            width: width,
            height: height,
        });
        return comp;
    };

    exports.Blank = Blank;

    if (typeof module !== "undefined") {
        module.exports = Blank;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Component = exports.Component;
    var Label = exports.Label;
    var Button = exports.Button;


    var Panel = Class.create({
        superclass: Component,

        init: function() {
            this.id = this.id || "panel_" + Core._SN++;

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.initBase();

            this.initHead();

            this.initChildren();

            this._toSortChildren = true;

            if (this.afterInit) {
                this.afterInit();
            }
        },

        initHead: function() {
            if (this.titleInfo) {
                if (!("left" in this.titleInfo)) {
                    this.titleInfo.left = 8;
                }
                if (!("top" in this.titleInfo)) {
                    this.titleInfo.top = 8;
                }
                this.titleInfo.fontSize = this.titleInfo.fontSize || 20;
                this.titleInfo.parent = this;
                this.titleLabel = new Label(this.titleInfo);
            }

            if (this.closeBtnInfo) {
                this.closeBtnInfo.parent = this;
                this.closeButton = new Button(this.closeBtnInfo);
            }
        },
    });

    exports.Panel = Panel;

    if (typeof module !== "undefined") {
        module.exports = Panel;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Component = exports.Component;
    var ImageHolder = exports.ImageHolder;
    var TextHolder = exports.TextHolder;

    var Label = Class.create({
        superclass: Component,

        initialize: function() {
            this.composite = false;
            this.disabled = false;

            this.width = "auto";
            this.height = "auto";

            this.textExtWidth = 0;
            this.textExtHeight = 0;

            this.scaleBg = false;

            this.backgroundColor = null;
            this.borderWidth = 0;

            this.sizeHolder = 0.0001;
            this.sizePadding = 2;
        },

        init: function() {
            this.id = this.id || "label_" + Core._SN++;

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.initBase();

            this._sizeChanged = true;

            if (this.iconInfo) {
                this.iconHolder = this.addImageHolder(this.iconInfo);
            }

            if (!this.textInfo && this.text) {
                this.textInfo = {
                    text: this.text
                }
            }
            this.setTextInfo(this.textInfo);

            this.computeTextSize();
            this.computeSelf();
            this.updateAABB();

            this.setDisabled(this.disabled);

            if (this.afterInit) {
                this.afterInit();
            }

            this._needToComputeSize = true;
        },

        setIconInfo: function(iconInfo) {
            if (!iconInfo) {
                this.iconHolder = null;
            } else {
                if (!this.iconHolder) {
                    this.iconHolder = new ImageHolder(iconInfo);
                    this.iconHolder.parent = this;
                    this.iconHolder.init();
                } else {
                    this.iconHolder.setImageInfo(iconInfo);
                }
            }
            this._needToCompute = true;
        },

        setTextInfo: function(textInfo) {
            if (!textInfo) {
                return;
            }

            this.initTextInfo(textInfo);

            if (!this.textHolder) {
                this.textHolder = new TextHolder(textInfo);
                this.textHolder.parent = this;
                this.textHolder.init();
            } else {
                this.textHolder.setTextInfo(textInfo);
            }
            this._needToCompute = true;
            this._needToComputeSize = true;
        },

        setTextColor: function(color) {
            if (this.textHolder) {
                this.textHolder.setColor(color);
            }
        },

        initTextInfo: function(textInfo) {
            if (!textInfo) {
                return;
            }
            var Me = this;

            var property = [
                "text",
                "color",
                "textAlign",
                "verticalAlign",
                "strokeColor",
                "strokeWidth",
                "fontSize",
                "fontWeight",
                "fontStyle",
                "fontName",
                "lineHeight",
            ];
            property.forEach(function(p) {
                if (!(p in textInfo) && (p in Me)) {
                    textInfo[p] = Me[p];
                }
            });
        },

        setText: function(text, needToCompute) {
            if (!this.textHolder) {
                return;
            }

            if (this.textInfo) {
                this.textInfo.text = text;
            }
            this.textHolder.setText(text);
            this.textHolder.updateText();
            this._needToComputeSize = this.textHolder.textChanged;
            this._needToCompute = needToCompute !== false;
        },

        computeAutoWidth: function() {
            var pixel = this.pixel;
            var width;
            if (this.textHolder) {
                var extWidth = (this.textHolder.pixel.left || 0) + (this.textHolder.pixel.right || 0);
                width = this.textHolder.areaWidth + extWidth;
            } else if (this.backgroundImageHolder) {
                width = this.backgroundImageHolder.pixel.width;
            } else {
                width = this.textExtWidth;
            }
            width += pixel.paddingLeft + pixel.paddingRight;
            pixel.width = width;
        },

        computeAutoHeight: function() {
            var pixel = this.pixel;
            var height;
            if (this.textHolder) {
                var extHeight = (this.textHolder.pixel.top || 0) + (this.textHolder.pixel.bottom || 0);
                height = this.textHolder.areaHeight + extHeight;
            } else if (this.backgroundImageHolder) {
                height = this.backgroundImageHolder.pixel.height;
            } else {
                height = this.textExtHeight;
            }
            height += pixel.paddingTop + pixel.paddingBottom;
            pixel.height = height;
        },

        computeWidth: function() {
            var pixel = this.pixel;

            if (this._width === "auto") {
                this.computeAutoWidth();
            } else {
                pixel.width = Utils.parseValue(this.width, pixel.realOuterWidth);
            }
            pixel.width = pixel.width || this.sizeHolder;
            this.absoluteWidth = pixel.width;

            var bg = this.backgroundImageHolder;
            if (bg && this.scaleBg) {
                bg.pixel.width = this._absoluteWidth;
                bg.absoluteWidth = this._absoluteWidth;
            }
        },

        computeHeight: function() {
            var pixel = this.pixel;

            if (this._height === "auto") {
                this.computeAutoHeight();
            } else {
                pixel.height = Utils.parseValue(this.height, pixel.realOuterHeight);
            }
            pixel.height = pixel.height || this.sizeHolder;
            this.absoluteHeight = pixel.height;

            var bg = this.backgroundImageHolder;
            if (bg && this.scaleBg) {
                bg.pixel.height = this._absoluteHeight;
                bg.absoluteHeight = this._absoluteHeight;
            }
        },

        computeTextSize: function(immediately) {
            if (!this.textHolder || !this.textHolder.measure) {
                return;
            }
            var pixel = this.textHolder.pixel;

            // var ext = this.sizePadding * 2 + this.borderWidth;
            var extWidth = this.borderWidth + this.paddingLeft + this.paddingRight + (pixel.left || 0) + (pixel.right || 0);
            var extHeight = this.borderWidth + this.paddingTop + this.paddingBottom + (pixel.top || 0) + (pixel.bottom || 0);

            this.textWidth = this.textHolder.textWidth;
            this.textHeight = this.textHolder.textHeight;

            this.textExtWidth = this.textWidth + extWidth;
            this.textExtHeight = this.textHeight + extHeight;
        },

        compute: function() {
            this.computeSelf();
            this.updateHolders();
            if (this.textHolder) {
                this.textHolder.update(true);
            }
            this.updateAABB();
        },

        updateSizeWithText: function() {
            if (this.textHolder) {
                this.textHolder.updateText();
                this.textHolder.updateSize();
                this.textHolder.updatePosition();
            }
            this.computeTextSize();

            var bg = this.borderImageHolder;
            if (bg && bg.borderImage) {
                bg.cacheCanvas = null;
            }

            this._needToCompute = true;
        },

        update: function(timeStep, now, forceCompute) {
            this.beforeUpdate && this.beforeUpdate(timeStep, now);

            forceCompute = ((this.reflowComputeTimes--) > 0) || forceCompute;
            this._needToCompute = this._needToCompute || forceCompute;

            var resized = (this._width === "auto" || this._height === "auto") && this._sizeChanged;

            this.updateSelf(timeStep, now);

            if (this._needToComputeSize || !this.textWidth) {
                this.updateSizeWithText();
                resized = true;
            }

            if (this._needToCompute) {
                // console.log("compute of Label.", this.id);
                this.compute();
            }

            if (resized) {
                this.resizeParents();
            }

            this.afterUpdate && this.afterUpdate(timeStep, now);

            this._needToComputeSize = false;

            this._sizeChanged = false;
            this._positionChanged = false;
            this._needToCompute = false;
            this._needToComputeChildren = false;
        },
    });


    exports.Label = Label;

    if (typeof module !== "undefined") {
        module.exports = Label;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Label = exports.Label;
    var ButtonComponent = exports.ButtonComponent;

    var Button = Class.create({
        superclass: Label,

        initialize: function() {
            this.borderWidth = 0;
            this.textAlign = "center";

            this.scaleBg = true;
        },

        init: function() {
            this.id = this.id || "button_" + Core._SN++;

            Button.$super.init.call(this);
        },

        onDown: function(x, y, id) {
            this._normalOffsetY = this.offsetY;
            this._normalScale = this.scale;

            this.offsetY = this.offsetY + 2;
            this.scale = this.scale * 0.92;
        },
        onUp: function(x, y, id) {
            this.offsetY = this._normalOffsetY || 0;
            this.scale = this._normalScale || 1;
        },

        setDisabled: function(disabled, force) {
            if (this.disabled === disabled && !force){
                return;
            }
            this.disabled = disabled;
            if (disabled) {
                this.alpha = 0.6;
            } else {
                this.alpha = this._defaultAlpha;
            }
        },
    });

    ButtonComponent.applyTo(Button.prototype);

    exports.Button = Button;

    if (typeof module !== "undefined") {
        module.exports = Button;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Component = exports.Component;
    var ImageHolder = exports.ImageHolder;
    var TextHolder = exports.TextHolder;

    var Picture = Class.create({
        superclass: Component,

        initialize: function() {
            this.composite = false;
            this.disabled = false;

            this.width = "auto";
            this.height = "auto";

            this.imgWidth = "auto";
            this.imgHeight = "auto";

            // 如果不指定宽高 且 scaleImg = false, 大小由 imageHolder 的实际大小决定.
            // TODO: 多种方式缩放
            this.scaleImg = true;
            this.lockScaleRatio = true;

            this.crossOrigin = 'Anonymous';
        },

        init: function() {
            this.id = this.id || "picture_" + Core._SN++;

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.initBase();

            this.imageHolder = new ImageHolder({
                parent: this,
                fillParent: this.scaleImg,
                lockScaleRatio: this.lockScaleRatio,
                width: this.imgWidth || "auto",
                height: this.imgHeight || "auto",
                alignH: "center",
                alignV: "center",
                crossOrigin: this.crossOrigin,
                tint: this.tint,
            });
            this.imageHolder.init();

            if (this.borderImageInfo) {
                this.setBorderImage(this.borderImageInfo);
            }

            if (this.src) {
                this.setSrc(this.src);
            } else if (this.img) {
                this.setImg(this.img);
            } else if (this.imgInfo) {
                this.setImageInfo(this.imgInfo);
            }

            if (this.afterInit) {
                this.afterInit();
            }
        },

        setTint: function(tint) {
            this.tint = tint;
            this.imageHolder.tint = tint;
        },

        getTint: function(tint) {
            return this.tint;
        },

        setSrc: function(src) {
            this.src = src;
            var Me = this;
            var flexible = this._width === "auto" || this._height === "auto";
            this.imageHolder.setSrc(src, function(img) {
                if (img) {
                    Me._sizeChanged = true;
                }
                Me.hasImg = !!Me.imageHolder.img;
                Me._needToCompute = true;
                if (Me.onImageLoad) {
                    Me.onImageLoad(img);
                }
            });
        },
        onImageLoad: null,

        setImg: function(img) {
            this.img = img;
            var Me = this;
            var flexible = this._width === "auto" || this._height === "auto";
            this.imageHolder.setImg(img, function(img) {
                if (img) {
                    Me._sizeChanged = true;
                }
                Me.hasImg = !!Me.imageHolder.img;
                Me._needToCompute = true;
            });
        },

        setImageInfo: function(imgInfo) {
            this.imageHolder.setImageInfo(imgInfo);
            this.imageHolder.tint = this.tint;
            this.hasImg = !!this.imageHolder.img;
            this._needToCompute = true;
        },

        computeAutoWidth: function() {
            var width = this.imageHolder ? this.imageHolder._displayWidth : 0;
            this.pixel.width = width;
        },

        computeAutoHeight: function() {
            var height = this.imageHolder ? this.imageHolder._displayHeight : 0;
            this.pixel.height = height;
        },

        compute: function() {
            this.computeSelf();

            this.updateHolders();
            if (this.imageHolder) {
                this.imageHolder.update(true);
            }

            this.updateAABB();
        },

        refreshImage: function(){
            var displayObject = this.imageHolder.displayObject;
            if (displayObject){
                displayObject.updateTexture();
            }
        },

        update: function(timeStep, now, forceCompute) {
            this.beforeUpdate && this.beforeUpdate(timeStep, now);

            forceCompute = ((this.reflowComputeTimes--) > 0) || forceCompute;
            this._needToCompute = this._needToCompute || forceCompute;

            var resized = (this._width === "auto" || this._height === "auto") && this._sizeChanged;

            this.updateSelf(timeStep, now);

            if (this._needToCompute) {
                // console.log("compute of Picture.", this.id);
                this.compute();
            }

            if (resized) {
                this.resizeParents();
            }

            this.afterUpdate && this.afterUpdate(timeStep, now);

            this._sizeChanged = false;
            this._positionChanged = false;
            this._needToCompute = false;
            this._needToComputeChildren = false;
        },
    });

    exports.Picture = Picture;

    if (typeof module !== "undefined") {
        module.exports = Picture;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Component = exports.Component;
    // var Panel = exports.Panel;
    var Slider = exports.Slider;

    var noop = exports.noop;


    var ScrollView = Class.create({
        superclass: Component,

        initialize: function() {
            // this.computeWidth = Panel.prototype.computeWidth;
            // this.computeHeight = Panel.prototype.computeHeight;

            this.scrollH = false;
            this.scrollV = true;

            this.scrollX = 0;
            this.scrollY = 0;
            this.scrollDX = 0;
            this.scrollDY = 0;

            this.clipArea = true;

            this.outEdge = 90;
            this.damping = 0.0025;
            this.swipeScale = 1.2;
            this.minScrollVel = 0.12;
            this.bounceDuration = 180;
            this.scrollingDuration = 700;

            this.scrollThumb = true;
            this.thumbWidth = 10;
            this.thumbColor = "rgba(255,255,255,0.6)";
            this.thumbBgColor = "rgba(0,0,0,0.4)";

            // TODO
            this.snapWidth = null;
            this.snapHeight = null;

        },

        init: function() {
            this.id = this.id || "scrollview_" + Core._SN++;

            if (this.beforeInit) {
                this.beforeInit();
            }

            this.initBase();

            this.visibleChildren = [];

            this.slider = new Slider({});
            if (this.damping) {
                this.slider.damping = this.damping;
            }
            this.scrollWidthOrigin = this.scrollWidth;
            this.scrollHeightOrigin = this.scrollHeight;

            this.initChildren();

            this._toSortChildren = true;

            this.resetScrollInfo();

            if (this.afterInit) {
                this.afterInit();
            }
        },

        computeScrollInfo: function() {
            var firstChild = this.children[0];
            if (firstChild) {
                var lastChild = this.children[this.children.length - 1];

                var innerWidth = lastChild.absoluteX + lastChild.absoluteWidth + lastChild.marginRight - firstChild.absoluteX + firstChild.marginLeft;
                innerWidth += this.paddingLeft + this.paddingRight;
                var innerHeight = lastChild.absoluteY + lastChild.absoluteHeight + lastChild.marginBottom - firstChild.absoluteY + firstChild.marginTop;
                innerHeight += this.paddingTop + this.paddingBottom;

                this.scrollWidth = this.scrollWidthOrigin || innerWidth;
                this.scrollHeight = this.scrollHeightOrigin || innerHeight;
            } else {
                this.scrollWidth = this.scrollWidthOrigin || 0;
                this.scrollHeight = this.scrollHeightOrigin || 0;
            }

            this.minScrollX = this.minScrollY = 0;
            this.maxScrollX = Math.max(0, this.scrollWidth - this._absoluteWidth);
            this.maxScrollY = Math.max(0, this.scrollHeight - this._absoluteHeight);

            this.scrollX = Math.min(Math.max(this.scrollX, this.minScrollX), this.maxScrollX);
            this.scrollY = Math.min(Math.max(this.scrollY, this.minScrollY), this.maxScrollY);

            this.rateWidth = this._absoluteWidth / this.scrollWidth;
            this.rateHeight = this._absoluteHeight / this.scrollHeight;

            this.thumbHSize = (this._absoluteWidth - this.paddingLeft - this.paddingRight) * this.rateWidth >> 0;
            this.thumbVSize = (this._absoluteHeight - this.paddingTop - this.paddingBottom) * this.rateHeight >> 0;
        },

        resetScrollInfo: function() {
            this.computeScrollInfo();

            this.slider.reset();
            this.scrolling = 0;
            this.scrollX = this.scrollDX = 0;
            this.scrollY = this.scrollDY = 0;
            this.lastScrollX = this.lastScrollY = 0;
            this.visibleChildren.length = 0;

            this.thumbX = this.scrollX * this.rateWidth >> 0;
            this.thumbY = this.scrollY * this.rateHeight >> 0;

            this.stopTween();

            this.onReset();
        },
        onReset: noop,

        reset: function() {
            this.resetScrollInfo();
        },

        startScroll: function(vx, vy) {
            if (!this.scrollH) {
                vx = 0;
            }
            if (!this.scrollV) {
                vy = 0;
            }
            if (Math.abs(vx) < this.minScrollVel && Math.abs(vy) < this.minScrollVel) {
                return;
            }
            this.scorllOver = false;
            this.slider.toStart = true;
            this.slider.start(vx, vy);
        },

        stopScroll: function() {
            this.slider.stop();
            this.stopTween();
        },

        focusOnChild: function(child, paddingX, paddingY) {
            paddingX = paddingX || this.paddingLeft;
            paddingY = paddingY || this.paddingTop;

            var aabb = child.aabb
            var aabb2 = this.aabb;
            var outLeft = (aabb[0] - paddingX) - aabb2[0];
            var outRight = (aabb[2] + paddingX) - aabb2[2];
            var outTop = (aabb[1] - paddingY) - aabb2[1];
            var outBottom = (aabb[3] + paddingY) - aabb2[3];

            var dx = 0,
                dy = 0;
            if (outLeft < 0) {
                dx = outLeft;
            } else if (outRight > 0) {
                dx = outRight;
            }

            if (outTop < 0) {
                dy = outTop;
            } else if (outBottom > 0) {
                dy = outBottom;
            }

            if (dx || dy) {
                this.scrollBy(dx, dy);
                return [dx, dy];
            }
            return false;
        },

        scrollTo: function(x, y) {
            this.stopTween();
            if (this.scrollH) {
                this.setScrollX(x);
            }
            if (this.scrollV) {
                this.setScrollY(y);
            }
        },

        scrollBy: function(dx, dy) {
            this.scrolling = this.scrollingDuration;
            if (this.scrollH) {
                if (this.scrollX < this.minScrollX && dx < 0 || this.scrollX > this.maxScrollX && dx > 0) {
                    dx = dx * 0.3;
                }
                this.setScrollX(this.scrollX + dx);
            }
            if (this.scrollV) {
                if (this.scrollY < this.minScrollY && dy < 0 || this.scrollY > this.maxScrollY && dy > 0) {
                    dy = dy * 0.3;
                }
                this.setScrollY(this.scrollY + dy);
            }
        },
        setScrollX: function(scrollX) {
            this.scrollX = Math.max(this.minScrollX - this.outEdge, Math.min(this.maxScrollX + this.outEdge, scrollX));
            this.thumbX = this.scrollX * this.rateWidth >> 0;
        },
        setScrollY: function(scrollY) {
            this.scrollY = Math.max(this.minScrollY - this.outEdge, Math.min(this.maxScrollY + this.outEdge, scrollY));
            this.thumbY = this.scrollY * this.rateHeight >> 0;
        },
        canScroll: function() {
            var canX = this.scrollH;
            if (this.scrollX <= this.minScrollX - this.outEdge / 2 || this.scrollX >= this.maxScrollX + this.outEdge / 2) {
                canX = false
            }
            if (canX) {
                return true;
            }
            var canY = this.scrollV;
            if (this.scrollY <= this.minScrollY - this.outEdge / 2 || this.scrollY >= this.maxScrollY + this.outEdge / 2) {
                canY = false
            }
            return canY;
        },

        startTween: function(target, duration) {

            target = target || {
                x: this.scrollX,
                y: this.scrollY,
            }

            if (this.scrollH && this.snapWidth) {
                target.x = Math.round(target.x / this.snapWidth) * this.snapWidth;
            }
            if (this.scrollV && this.snapHeight) {
                target.y = Math.round(target.y / this.snapHeight) * this.snapHeight;
            }
            target.x = Math.min(this.maxScrollX, Math.max(this.minScrollX, target.x));
            target.y = Math.min(this.maxScrollY, Math.max(this.minScrollY, target.y));

            this.stopTween();

            var Me = this;
            var _cx = this.scrollX;
            var _cy = this.scrollY;
            var _dx = target.x - _cx;
            var _dy = target.y - _cy;

            if (_dx || _dy) {
                this.tween = {
                    duration: (duration === 0 || duration) ? duration : this.bounceDuration,
                    played: 0,
                    target: target,
                    onUpdate: function(k) {
                        var dx = _cx + _dx * k - Me.scrollX;
                        var dy = _cy + _dy * k - Me.scrollY;
                        if (dx || dy) {
                            Me.scrollBy(dx, dy);
                        }
                    },
                    onComplete: function() {
                        Me.scrollX = this.target.x;
                        Me.scrollY = this.target.y;
                        Me.thumbX = Me.scrollX * Me.rateWidth >> 0;
                        Me.thumbY = Me.scrollY * Me.rateHeight >> 0;
                        Me.scorllOver = true;
                        Me.stopScroll();
                        Me.afterTween(Me.scrollX, Me.scrollY);
                    },
                }
            }
        },

        stopTween: function() {
            this.tween = null;
        },

        afterTween: function(x, y) {
            // do nothing.
        },

        updateTween: function(timeStep) {
            var tween = this.tween;
            if (!tween) {
                return false;
            }
            tween.played += timeStep;
            if (tween.played < 0) {
                return false;
            }
            var k = tween.played / tween.duration;
            if (k >= 1) {
                k = 1;
                tween.onComplete();
                this.stopTween();
            } else {
                tween.onUpdate(k);
            }
            return true;

        },

        onTouchStart: function(x, y, id) {
            if (this.containPoint(x, y)) {
                this.stopScroll();
            }
            return false;
        },

        onTouchEnd: function(x, y, id) {
            this.startTween();
            return false;
        },

        onPan: function(x, y, dx, dy, startX, startY, id) {
            // if (this.containPoint(startX, startY)) {
            if (this.scrollV && this.scrollH && this.containPoint(x, y)) {
                this.scrollBy(-dx, -dy);
                return;
            }
            if (this.scrollV && this.containPoint(x, startY) ||
                this.scrollH && this.containPoint(startX, y)) {
                this.scrollBy(-dx, -dy);
                return;
            }
            return false;
        },

        onSwipe: function(x, y, vx, vy, startX, startY, id) {
            if (this.containPoint(startX, startY)) {
                vx = vx * this.swipeScale;
                vy = vy * this.swipeScale;
                this.startScroll(-vx, -vy);
                return;
            }
            return false;
        },


        compute: function() {
            this.computeSelf();
            this.layout.compute(this);
            this.computeScrollInfo();
            // this.resetScrollInfo();
            if (this.clipArea) {
                this.syncMask();
            }
            this.updateHolders();
            this.updateAABB();
        },

        updateSelf: function(timeStep, now) {
            this.updateTween(timeStep);

            if (this.scorllOver) {
                return;
            }
            var scrolling = this.slider.update(timeStep);
            if (scrolling) {
                this.scrollBy(this.slider.dx, this.slider.dy);
            }
            if (!scrolling || !this.canScroll()) {
                this.scorllOver = true;
                this.startTween();
            }

        },

        updateChildren: function(timeStep, now) {
            // this.children.forEach(function(child) {
            //     child.update(timeStep, now);
            // });

            var Me = this;
            this.scrollDX = this.scrollX - this.lastScrollX;
            this.scrollDY = this.scrollY - this.lastScrollY;

            var vc = this.visibleChildren;
            var scrollChanged = this.scrollDX || this.scrollDY || vc.length === 0;
            if (scrollChanged) {
                // console.log("scrolling : ", this.id, this.scrollDX, this.scrollDY, vc.length);
                vc.length = 0;
            }
            this.children.forEach(function(child, idx) {
                if (scrollChanged) {
                    //     // child.moveBy(-Me.scrollDX, -Me.scrollDY);
                    child.syncPosition();
                    child.visible = Me.checkCollideAABB(child.aabb);
                    if (child.visible) {
                        vc.push(child);
                    }
                }
                child.update(timeStep, now);
            });

            // console.log(frame, vc.length)
            this.scrollDX = 0;
            this.scrollDY = 0;
            this.lastScrollX = this.scrollX;
            this.lastScrollY = this.scrollY;
        },


        getTouchableChildren: function() {
            // return this.children;
            return this.visibleChildren;
        },

    });


    exports.ScrollView = ScrollView;

    if (typeof module !== "undefined") {
        module.exports = ScrollView;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;

    var Component = exports.Component;
    var Button = exports.Button;

    var SwitchButton = Class.create({
        superclass: Button,

        initialize: function() {
            this.tabIndex = 0;
            this.group = null;
            this.linkComp = null;

            this.active = false;

            this.bgImgNormal = null;
            this.bgImgActive = null;
            this.bgInfoNormal = null;
            this.bgInfoActive = null;
        },

        init: function() {
            this.id = this.id || "switchbutton_" + Core._SN++;

            var img = this.bgImgActive;
            var info = this.bgInfoActive;
            if (img && !info) {
                info = {
                    img: img
                };
            }
            this.bgInfoActive = info;

            var img = this.bgImgNormal;
            var info = this.bgInfoNormal;
            if (img && !info) {
                info = {
                    img: img
                };
            }
            this.bgInfoNormal = info;

            this.backgroundInfo = this.active ? this.bgInfoActive : this.bgInfoNormal;

            SwitchButton.$super.init.call(this);

        },

        activate: function(link) {
            if (this.active) {
                return;
            }

            if (this.linkComp) {
                var comp = this.linkComp;
                if (typeof comp === "string") {
                    comp = this.root.all[comp];
                }
                if (comp) {
                    comp.show();
                }
            }

            if (this.group) {
                var Me = this;
                this.group.forEach(function(tab) {
                    if (typeof tab === "string") {
                        tab = Me.root.all[tab];
                    }
                    if (tab && tab !== Me) {
                        tab.inactivate();
                    }
                });
            }

            this.active = true;
            this.onActivate(link);
            if (this.backgroundImageHolder) {
                this.backgroundImageHolder.setImageInfo(this.bgInfoActive);
            }
        },

        inactivate: function() {
            if (!this.active) {
                return;
            }
            if (this.linkComp) {
                var comp = this.linkComp;
                if (typeof comp === "string") {
                    comp = this.root.all[comp];
                }
                if (comp) {
                    comp.hide();
                }
            }
            this.active = false;
            this.onInactivate();
            if (this.backgroundImageHolder) {
                this.backgroundImageHolder.setImageInfo(this.bgInfoNormal);
            }
        },

        onTap: function(x, y, id) {
            this.activate();
        },
        onInactivate: function() {

        },
        onActivate: function() {

        },

    });

    exports.SwitchButton = SwitchButton;

    if (typeof module !== "undefined") {
        module.exports = SwitchButton;
    }

}(CUI));

// TODO

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Panel = exports.Panel;
    var Button = exports.Button;

    var SliderBar = Class.create({
        superclass: Panel,

        initialize: function() {
            this.visible = true;
            this.disabled = false;

            this.vertical = false;

            this.min = 0;
            this.max = 1;
            this.value = 0.5;

            this.step = 0.2;

            this.trackInfo = null;
            this.handleInfo = null;

            this.track = null;
            this.handle = null;
        },

        initChildren: function() {

            var Me = this;
            var trackInfo = this.trackInfo || {};
            var handleInfo = this.handleInfo || {};

            var options = {
                parent: Me,

                width: "100%",
                height: "70%",
                alignH: "center",
                alignV: "center",

                // borderWidth: 2,

                onDown: function(x, y, id) {
                    // this.offsetY = 2;
                    // this.scale = 0.92;

                },
                // onUp: function(x,y,id) {
                //     // this.offsetY = 0;
                //     // this.scale = 1;
                // },
                onTap: function(x, y, id) {
                    if (Me.vertical) {
                        var distance = Me.handle.relativeY + Me.handle._absoluteHeight / 2;
                        var sign = y < Me.handle._absoluteY ? -1 : 1;
                        var stepPixel = distance * Me.step * sign;
                        Me.scrollBy(0, stepPixel);
                    } else {
                        var distance = Me.handle.relativeX + Me.handle._absoluteWidth / 2;
                        var sign = x < Me.handle._absoluteX ? -1 : 1;
                        var stepPixel = distance * Me.step * sign;
                        Me.scrollBy(stepPixel, 0);
                    }
                }
            };
            for (var p in trackInfo) {
                options[p] = trackInfo[p];
            }
            this.track = new Button(options);

            var options = {
                parent: Me,

                width: 60,
                height: "100%",
                alignH: "center",
                alignV: "center",

                // borderWidth: 2,

                pressX: null,
                pressY: null,
                value: 0,
                touchStart: function(x, y, id) {
                    if (this.disabled) {
                        return false;
                    }
                    Me.canHandle = true;
                    this.touchId = id;
                    this.pressX = x;
                    this.pressY = y;
                    this.scale = 0.95;
                },
                touchEnd: function(x, y, id) {
                    if (this.disabled) {
                        return false;
                    }
                    Me.canHandle = false;
                    if (this.touchId === id) {
                        this.touchId = this.pressX = this.pressY = null;
                        this.scale = 1.0;
                    }
                    return false;
                },

                onTap: function(x, y, id) {
                    return true;
                },
            };
            for (var p in handleInfo) {
                options[p] = handleInfo[p];
            }
            this.handle = new Button(options);

            this.first = true;

        },

        updateSelf: function() {
            if (this.first) {
                this.first = false;
                this.updateTrack();
                this.setValue(this.value);
            }
        },

        scrollBy: function(dx, dy) {
            this.updateTrack();

            if (this.vertical) {
                if (dy < 0) {
                    var ny = this.handle.relativeY + dy;
                    if (ny < 0) {
                        dy = 0 - this.handle.relativeY;
                    }
                } else if (dy > 0) {
                    var ny = this.handle.relativeY + this.handle._absoluteHeight + dy;
                    if (ny > this._absoluteHeight) {
                        dy = this._absoluteHeight - this.handle._absoluteHeight - this.handle.pixel.baseY;
                    }
                }
                this.handle.moveBy(0, dy);
            } else {
                if (dx < 0) {
                    var nx = this.handle.relativeX + dx;
                    if (nx < 0) {
                        dx = 0 - this.handle.relativeX;
                    }
                } else if (dx > 0) {
                    var nx = this.handle.relativeX + this.handle._absoluteWidth + dx;
                    if (nx > this._absoluteWidth) {
                        dx = this._absoluteWidth - this.handle._absoluteWidth - this.handle.pixel.baseX;
                    }
                }
                this.handle.moveBy(dx, 0);
            }
            var p = this.handle.relativeX / this.trackRealSize;
            this.value = p * (this.max - this.min) + this.min;
            this.onChanged(this.value);
        },

        setValue: function(value) {
            value = Math.min(Math.max(this.min, value), this.max);
            this.value = value;
            var p = (value - this.min) / (this.max - this.min);
            var dis = p * this.trackRealSize;
            if (this.vertical) {
                this.handle.pixel.relativeY = dis;
                this.handle.relativeY = dis;
            } else {
                this.handle.pixel.relativeX = dis;
                this.handle.relativeX = dis;
            }
            this.handle.syncPosition();
        },

        updateTrack: function() {
            this.minX = 0;
            this.minY = 0;
            this.maxX = this._absoluteWidth - this.handle._absoluteWidth;
            this.maxY = this._absoluteHeight - this.handle._absoluteHeight;
            this.trackRealSize = this.vertical ? this.maxY : this.maxX;
        },

        pan: function(x, y, dx, dy, sx, sy, id) {
            if (!this.visible || !this.canHandle || !this.containPoint(x, y)) {
                return false;
            }
            if (this.disabled) {
                return false;
            }
            // if (this.touchId === id) {
            this.scrollBy(dx, dy);
            // }
        },

        onChanged: function(value) {
            // console.log(value)
        },
    });

    exports.SliderBar = SliderBar;

}(CUI));

// TODO

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Label = exports.Label;

    var TextBlock = Class.create({
        superclass: Label,
    });

    exports.TextBlock = TextBlock;

    if (typeof module !== "undefined") {
        module.exports = TextBlock;
    }

}(CUI));

"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var Point = function(x, y) {
        this.set(x || 0, y || 0);
    };

    Point.prototype.set = function(x, y) {
        this.x = x;
        if (y === undefined) {
            y = x;
        }
        this.y = y;
    };

    var DisplayObject = Class.create({

        initialize: function() {
            this.position = new Point(0, 0);
            this.pivot = new Point(0, 0);
            this.scale = new Point(1, 1);

            this.children = [];

            this.width = 0;
            this.height = 0;
            this.alpha = 1;
            this.rotation = 0;
            this.visible = true;
            this.zIndex = 0;
            this.tint = null;

            this.composite = null;
            this.mask = null;

            this._absoluteAlpha = 1;
            this._ignoreResize = false;
            this.parent = null;

            this.rect = null;
            this.image = null;
            this.borderImage = null;

        },

        updateTexture: function(){
            // do nothing
        },

        addChild: function(child) {
            child.parent = this;
            this.children.push(child);
        },

        addChildAt: function(child, index) {
            if (index < 0 || index > this.children.length) {
                throw new Error('child.addChildAt: The index ' + index + ' supplied is out of bounds ' + this.children.length);
            }

            if (child.parent) {
                child.parent.removeChild(child);
            }

            child.parent = this;

            this.children.splice(index, 0, child);
        },

        removeChild: function(child) {
            var index = this.children.indexOf(child);

            if (index === -1) {
                return null;
            }

            this.children.splice(index, 1);
            child.parent = null;
            return child;
        },

        getChildIndex: function(child) {
            var index = this.children.indexOf(child);

            if (index === -1) {
                throw new Error('The supplied DisplayObject must be a child of the caller');
            }

            return index;
        },

        sortChildren: function() {
            this.children.sort(function(a, b) {
                return a.zIndex - b.zIndex || a.index - b.index;
            });
        },

        destroy: function() {
            this.children.forEach(function(child) {
                child.parent = null;
                if (typeof child.destroy === 'function') {
                    child.destroy();
                }
            });

            this.parent = null;
            this.position = null;
            this.pivot = null;
            this.scale = null;

            this.children = null;
        }

    });

    var properties = [

        {
            key: 'width',
            get: function() {
                return this._width;
            },
            set: function(value) {
                this._width = Math.abs(value);
                if (this.imageInfo) {
                    this.scale.x = Math.abs(this.scale.x) * (value < 0 ? -1 : 1);
                    // this.scale.x = (value / this.imageInfo.sw) || 1;
                }
            }
        },

        {
            key: 'height',
            get: function() {
                return this._height;
            },
            set: function(value) {
                this._height = Math.abs(value);
                if (this.imageInfo) {
                    this.scale.y = Math.abs(this.scale.y) * (value < 0 ? -1 : 1);
                    // this.scale.y = (value / this.imageInfo.sh) || 1;
                }
            }
        },
    ];

    Class.defineProperties(DisplayObject.prototype, properties);


    exports.Point = Point;
    exports.DisplayObject = DisplayObject;

    if (typeof module !== "undefined") {
        module.exports = DisplayObject;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var noop = exports.noop;

    var Font = exports.Font;
    var DisplayObject = exports.DisplayObject;

    var CanvasRenderer = Class.create({

        initialize: function() {
            this.canvas2d = true;

            this.lazyInit = false;
            this.canvas = null;
            this.context = null;
            this.clearColor = null;
        },

        init: function() {

            this.context = this.context || this.canvas.getContext("2d");
            this.canvas = this.canvas || this.context.canvas;
        },

        colorRgb: function(r, g, b) {
            return "rgba(" + r + ", " + g + ", " + b + ", 1)";
        },
        colorHex: function(value) {
            return value;
        },
        colroName: function(value) {
            return value;
        },

        clear: function() {
            if (this.clearColor !== null) {
                this.fillStyle = this.clearColor;
                this.fillRect(0, 0, this.canvas.width, this.canvas.height);
                return;
            }
            this.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },


        clipRect: function(x, y, width, height) {
            this.context.save();
            var t = this.globalTransform;
            var dx = x - t.originalX;
            var dy = y - t.originalY;

            var _context = this.context;
            _context.beginPath();
            _context.moveTo(dx, dy);
            _context.lineTo(dx + width, dy);
            _context.lineTo(dx + width, dy + height);
            _context.lineTo(dx, dy + height);
            _context.closePath();
            _context.clip();
            return _context;
        },

        render: function(displayObject) {
            if (displayObject.alpha <= 0 || !displayObject.visible) {
                return;
            }

            var ctx = this.context;

            ctx.save();

            displayObject._parentAlpha = displayObject.parent ? displayObject.parent._absoluteAlpha : 1;
            displayObject._absoluteAlpha = displayObject.alpha * displayObject._parentAlpha;

            ctx.globalAlpha = displayObject._absoluteAlpha;

            if (displayObject.composite) {
                ctx.globalCompositeOperation = displayObject.composite;
            }

            ctx.translate(displayObject.position.x, displayObject.position.y);
            ctx.rotate(displayObject.rotation);
            ctx.scale(displayObject.scale.x, displayObject.scale.y);

            ctx.translate(-displayObject.pivot.x, -displayObject.pivot.y);

            var x = 0;
            var y = 0;
            if (displayObject.mask) {
                var mask = displayObject.mask.rectInfo;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + mask.width, y);
                ctx.lineTo(x + mask.width, y + mask.height);
                ctx.lineTo(x, y + mask.height);
                ctx.closePath();
                ctx.clip();
            }

            // var x = -displayObject.pivot.x;
            // var y = -displayObject.pivot.y;
            // console.log(displayObject, x, y)
            if (displayObject.imageInfo) {
                this.drawImage(displayObject, x, y);

            } else if (displayObject.borderImageInfo) {
                this.drawBorderImage(displayObject, x, y);

            } else if (displayObject.rectInfo) {
                this.drawRect(displayObject, x, y);

            } else if (displayObject.textInfo) {
                this.drawText(displayObject, x, y);
            } else {
                // TODO
            }

            var children = displayObject.children;

            for (var i = 0, len = children.length; i < len; i++) {
                this.render(children[i]);
            }

            ctx.restore();
        },

        drawRect: function(displayObject, x, y) {
            x = x || 0;
            y = y || 0;
            var ctx = this.context;

            var info = displayObject.rectInfo;

            if (info.width <= 0 || info.height <= 0) {
                return;
            }

            x += info.x;
            y += info.y;

            if (info.color) {
                ctx.fillStyle = info.color;
                ctx.fillRect(x, y, info.width, info.height);
            }

            if (info.borderColor && info.borderWidth > 0 && info.borderAlpha > 0) {
                ctx.globalAlpha = info.borderAlpha * displayObject._parentAlpha;
                ctx.lineWidth = info.borderWidth;
                ctx.strokeStyle = info.borderColor;
                ctx.strokeRect(x, y, info.width, info.height);
            }
        },

        drawImage: function(displayObject, x, y) {
            x = x || 0;
            y = y || 0;
            var ctx = this.context;

            var info = displayObject.imageInfo;
            if (!info.img) {
                return;
            }

            var w = displayObject.width;
            var h = displayObject.height;

            if (w > 0 && h > 0) {
                ctx.drawImage(info.img, info.sx, info.sy, info.sw, info.sh, x, y, w, h);
            }
        },

        drawBorderImage: function(displayObject, x, y) {
            x = x || 0;
            y = y || 0;
            var ctx = this.context;

            var info = displayObject.borderImageInfo;
            var img = info["img"];
            if (!img) {
                return;
            }
            var w = displayObject.width;
            var h = displayObject.height;


            var sx = info["sx"];
            var sy = info["sy"];
            var sw = info["sw"];
            var sh = info["sh"];

            var T = info["T"];
            var R = info["R"];
            var B = info["B"];
            var L = info["L"];

            var bw = sw - L - R;
            var bh = sh - T - B;

            var CW = w - L - R;
            var CH = h - T - B;

            // center-
            if (CH > 0) {
                L > 0 && ctx.drawImage(img, sx, sy + T, L, bh,
                    x, y + T, L, CH);
                CW > 0 && ctx.drawImage(img, sx + L, sy + T, bw, bh,
                    x + L, y + T, CW, CH);
                R > 0 && ctx.drawImage(img, sx + sw - R, sy + T, R, bh,
                    x + w - R, y + T, R, CH);
            }

            // top-
            if (T > 0) {
                L > 0 && ctx.drawImage(img, sx, sy, L, T,
                    x, y, L, T);
                CW > 0 && ctx.drawImage(img, sx + L, sy, bw, T,
                    x + L, y, CW, T);
                R > 0 && ctx.drawImage(img, sx + sw - R, sy, R, T,
                    x + w - R, y, R, T);
            }

            // bottom-
            if (B > 0) {
                L > 0 && ctx.drawImage(img, sx, sy + sh - B, L, B,
                    x, y + h - B, L, B);
                CW > 0 && ctx.drawImage(img, sx + L, sy + sh - B, bw, B,
                    x + L, y + h - B, CW, B);
                R > 0 && ctx.drawImage(img, sx + sw - R, sy + sh - B, R, B,
                    x + w - R, y + h - B, R, B);
            }
        },


        drawText: function(displayObject, x, y) {
            // drawText: function(text, x, y, style) {
            x = x || 0;
            y = y || 0;
            var ctx = this.context;

            var info = displayObject.textInfo;
            // x += info._absoluteX;
            // y += info._absoluteY;
            CUI.Utils.renderTextContent(ctx, info, x, y);
        },

        /**
         *
         *
         *
         *
         *
         *
         **/

        createContainer: function() {
            var container = new DisplayObject();

            return container;
        },

        createSprite: function(image, sx, sy, sw, sh) {
            var sprite = new DisplayObject();

            var info = {
                img: image,
                sx: sx || 0,
                sy: sy || 0,
                sw: sw || (image ? image.width : 0),
                sh: sh || (image ? image.height : 0),
            };

            info.w = info.sw;
            info.h = info.sh;

            sprite.imageInfo = info;
            sprite.textureWidth = info.sw;
            sprite.textureHeight = info.sh;

            return sprite;
        },

        updateSprite: function(sprite, sx, sy, sw, sh, image) {
            var info = sprite.imageInfo || {};
            info.img = image || info.img;
            if (sx !== null) {
                info.sx = sx || 0;
            }
            if (sy !== null) {
                info.sy = sy || 0;
            }
            if (sw !== null) {
                info.sw = sw || sw === 0 ? sw : (image ? image.width : 0);
            }
            if (sh !== null) {
                info.sh = sh || sh === 0 ? sh : (image ? image.height : 0);
            }
            info.w = info.sw;
            info.h = info.sh;

            sprite.imageInfo = info;
            sprite.textureWidth = info.sw;
            sprite.textureHeight = info.sh;
        },

        createRect: function(width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha) {
            return this.updateRect(null, 0, 0, width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha);
        },

        updateRect: function(shape, x, y, width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha) {
            if (!shape) {
                shape = new DisplayObject();
            }

            shape.rectInfo = {
                x: x || 0,
                y: y || 0,
                width: width,
                height: height,
                color: backgroundColor,
                alpha: backgroundAlpha,
                borderWidth: borderWidth,
                borderColor: borderColor,
                borderAlpha: borderAlpha,
            };

            return shape;
        },

        createNineSlicePlane: function(image, sx, sy, sw, sh, L, T, R, B) {
            var sprite = new DisplayObject();

            if (arguments.length < 9) {
                L = sx;
                T = sy;
                R = sw;
                B = sh;
                sx = 0;
                sy = 0;
                sw = image ? image.width : 0;
                sh = image ? image.height : 0;
            }
            sprite.borderImageInfo = {
                img: image,
                sx: sx,
                sy: sy,
                sw: sw,
                sh: sh,
                L: L,
                T: T,
                R: R,
                B: B,
            };

            return sprite;
        },

        createTextObject: function(context, resolution) {
            var sprite;

            if (!context) {
                sprite = new DisplayObject();
                sprite.updateSize = noop;
                sprite.updateContent = noop;
            } else {
                var canvas = context.canvas;
                var sprite = this.createSprite(canvas);
                sprite.resolution = resolution || 1;
                sprite.context = context;
                sprite.canvas = canvas;
                sprite.padding = 0;
                sprite.updateSize = this._updateTextSize;
                sprite.updateContent = this._updateTextContent;
            }

            return sprite;
        },

        _updateTextSize: function() {
            this.imageInfo.sw = this.canvas.width;
            this.imageInfo.sh = this.canvas.height;
            this.imageInfo.w = this.canvas.width;
            this.imageInfo.h = this.canvas.height;

            this.textureWidth = this.imageInfo.sw;
            this.textureHeight = this.imageInfo.sh;
        },

        _updateTextContent: function() {

        }

    });

    exports.CanvasRenderer = CanvasRenderer;

    if (typeof module !== "undefined") {
        module.exports = CanvasRenderer;
    }

}(CUI));

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var noop = exports.noop;
    var Font = exports.Font;

    var PIXIRenderer = Class.create({

        initialize: function() {
            this.lazyInit = false;
            this.renderer = null;
        },

        colorRgb: function(r, g, b) {
            return (r << 16) + (g << 8) + b;
        },

        colorHex: function(value) {
            return parseInt(value.substr(-6), 16);
        },

        colroName: function(value) {
            // TODO
            return value;
        },

        /**
         *
         *
         *
         *
         *
         *
         **/

        createContainer: function() {
            var container = new PIXI.Container();

            return container;
        },

        createSprite: function(image, sx, sy, sw, sh) {
            var count = arguments.length;
            var texture;

            if (image && sx !== undefined) {
                texture = this._createTexture(image, sx, sy, sw, sh);
            } else if (image) {
                texture = this._createTexture(image);
            }

            var sprite = new PIXI.Sprite(texture);

            return sprite;
        },

        updateSprite: function(sprite, sx, sy, sw, sh, image) {
            var texture;
            if (image) {
                texture = this._createTexture(image, sx, sy, sw, sh);
                sprite.texture = texture;
                return;
            }

            texture = sprite._texture;
            var frame = texture._frame;

            if (sx !== null) {
                frame.x = sx;
            }
            if (sy !== null) {
                frame.y = sy;
            }
            if (sw !== null) {
                frame.width = sw;
            }
            if (sh !== null) {
                frame.height = sh;
            }

            texture._updateUvs();

            sprite._onTextureUpdate();
            texture.baseTexture.emit('update', texture.baseTexture);
        },

        createRect: function(width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha) {
            return this.updateRect(null, 0, 0, width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha);
        },

        updateRect: function(shape, x, y, width, height, backgroundColor, backgroundAlpha, borderWidth, borderColor, borderAlpha) {
            borderWidth = borderWidth || 0;
            if (shape) {
                shape.clear();
            } else {
                shape = new PIXI.Graphics();
                shape._ignoreResize = true;
            }
            shape.beginFill(backgroundColor, backgroundAlpha);
            if (borderWidth > 0 && (borderColor || borderColor === 0)) {
                shape.lineStyle(borderWidth, borderColor, borderAlpha, 0.5);
            }
            // shape.drawRect(borderWidth / 2, borderWidth / 2, width, height);
            shape.drawRect(x, y, width, height);
            shape.endFill();
            return shape;
        },

        createNineSlicePlane: function(image, sx, sy, sw, sh, L, T, R, B) {
            var count = arguments.length;
            var texture;

            if (count == 9) {
                texture = this._createTexture(image, sx, sy, sw, sh);
            } else {
                texture = this._createTexture(image);
                L = sx;
                T = sy;
                R = sw;
                B = sh;
            }

            var sprite = new PIXI.mesh.NineSlicePlane(texture, L, T, R, B);

            return sprite;
        },

        createTextObject: function(context, resolution) {
            var sprite;

            if (!context) {
                sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
                sprite.updateSize = noop;
                sprite.updateContent = noop;
            } else {
                var canvas = context.canvas;
                var texture = PIXI.Texture.fromCanvas(canvas);

                // texture.orig = new PIXI.Rectangle();
                texture.trim = new PIXI.Rectangle();
                sprite = new PIXI.Sprite(texture);

                sprite.resolution = resolution || 1;
                sprite.context = context;
                sprite.canvas = canvas;
                sprite.padding = 0;
                sprite.updateSize = this._updateTextSize;
                sprite.updateContent = this._updateTextContent;
            }

            return sprite;
        },

        _updateTextSize: function() {
            var texture = this._texture;

            texture.baseTexture.hasLoaded = true;
            texture.baseTexture.resolution = this.resolution;
            texture.baseTexture.realWidth = this.canvas.width;
            texture.baseTexture.realHeight = this.canvas.height;
            texture.baseTexture.width = this.canvas.width / this.resolution;
            texture.baseTexture.height = this.canvas.height / this.resolution;
            texture.trim.width = texture._frame.width = this.canvas.width / this.resolution;
            texture.trim.height = texture._frame.height = this.canvas.height / this.resolution;

            texture.trim.x = -this.padding;
            texture.trim.y = -this.padding;

            texture.orig.width = texture._frame.width - (this.padding * 2);
            texture.orig.height = texture._frame.height - (this.padding * 2);

            // call sprite onTextureUpdate to update scale if _width or _height were set
            this._onTextureUpdate();
            texture.baseTexture.emit('update', texture.baseTexture);
        },

        _updateTextContent: function() {
            var texture = this._texture;

            this._textureID = -1;
            texture.baseTexture.emit('update', texture.baseTexture);
        },

        _createTexture: function(image, sx, sy, sw, sh) {
            var count = arguments.length;
            var baseTexture = PIXI.BaseTexture.from(image);

            var rect = sw && sh ? new PIXI.Rectangle(sx, sy, sw, sh) : null;
            var texture = new PIXI.Texture(baseTexture, rect);

            return texture;
        },

    });

    exports.PIXIRenderer = PIXIRenderer;

    if (typeof module !== "undefined") {
        module.exports = PIXIRenderer;
    }

}(CUI));

if(typeof module !== "undefined"&&module){module.exports = CUI;}
