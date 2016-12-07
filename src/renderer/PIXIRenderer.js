"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Font = exports.Font;

    var PIXIRenderer = Class.create({

        lazyInit: false,

        core: null,
        canvas: null,
        context: null,
        clearColor: null,

        webgl: false,

        init: function() {

            if (!this.core) {
                // this.core = new PIXI.CanvasRenderer(canvas.width, canvas.height, {
                //     view: canvas,
                // });
                // this.core = PIXI.autoDetectRenderer(canvas.width, canvas.height, {
                //     view: canvas,
                // });
                var canvas = this.canvas;
                this.core = new PIXI.WebGLRenderer(canvas.width, canvas.height, {
                    view: canvas,
                });
                this.webgl = this.core.type === PIXI.RENDERER_TYPE.WEBGL;
                this.core.resize(canvas.width, canvas.height);
                this.core.backgroundColor = this.clearColor || 0;
            } else {
                this.canvas = this.core.view;
            }

            this.baseTexturePool = this.baseTexturePool || {};
            this.texturePool = this.texturePool || {};

            this.rootContainer = this.rootContainer || new PIXI.Container();

            this.globalContainer = new PIXI.Container();
            this.globalContainer.visible = false;
            this.rootContainer.addChild(this.globalContainer);

            this.maskContainer = new PIXI.Container();
            this.maskContainer.visible = false;
            this.rootContainer.addChild(this.maskContainer);

            // this.globalContainer.transform.worldTransform = this.globalContainer.transform.localTransform;

            this.shape = new PIXI.Graphics();
            this.globalContainer.addChild(this.shape);

            this.maskShape = new PIXI.Graphics();
            this.maskContainer.addChild(this.maskShape);

            this.globalTransform = {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                alpha: 1,
                originalX: 0,
                originalY: 0,
            };
            this.stack = [];
        },
        clear: function() {
            if (this.core._activeRenderTarget) {
                this.core.clear(this.clearColor);
            }
        },
        render: function() {
            // this.core.render(this.globalContainer);
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

        createDisplayObject: function(img, sx, sy, sw, sh, cached) {
            var count = arguments.length;
            var baseTexture = this.createBaseTexture(img);
            var texture;
            if (count >= 5) {
                texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(sx, sy, sw, sh));
            } else {
                texture = new PIXI.Texture(baseTexture);
                if (count == 2) {
                    cached = sx;
                }
            }
            var sprite = PIXI.Sprite.from(texture);
            if (!cached) {
                this.globalContainer.addChild(sprite);
            } else {

            }
            return sprite;
        },

        createTextObject: function(canvas, context, cached) {
            var texture = PIXI.Texture.fromCanvas(canvas);
            texture.orig = new PIXI.Rectangle();
            texture.trim = new PIXI.Rectangle();
            var sprite = PIXI.Sprite.from(texture);
            if (!cached) {
                this.globalContainer.addChild(sprite);
            } else {

            }
            sprite.resolution = this.core.resolution;
            sprite.context = context;
            sprite.canvas = canvas;
            sprite.padding = 0;
            sprite.updateSize = function() {
                const texture = this._texture;

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
            };
            return sprite;
        },

        createNineSliceObject: function(img, sx, sy, sw, sh, T, R, B, L, cached) {
            var count = arguments.length;
            var baseTexture = this.createBaseTexture(img);
            var texture;
            if (count >= 9) {
                texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(sx, sy, sw, sh));
            } else {
                texture = new PIXI.Texture(baseTexture);
                if (count === 6) {
                    cached = T;
                }
                T = sx;
                R = sy;
                B = sw;
                L = sh;
            }
            var sprite = new PIXI.mesh.NineSlicePlane(texture, L, T, R, B);
            if (!cached) {
                this.globalContainer.addChild(sprite);
            } else {

            }
            return sprite;
        },
        renderNineSliceObject: function(displayObject, dx, dy, dw, dh) {
            displayObject.width = dw;
            displayObject.height = dh;
            this.doDraw(displayObject, dx, dy);
        },

        strokeRect: function(x, y, width, height, color, lineWidth) {
            this.shape.clear();
            this.shape.lineStyle(lineWidth, color);
            this.drawRectShape(x, y, width, height);
            this.core.renderBasic(this.shape, null, false, null, true);
        },

        fillRect: function(x, y, width, height, color) {
            this.shape.clear();
            this.shape.beginFill(color);
            this.drawRectShape(x, y, width, height);
            this.shape.endFill();
            this.core.renderBasic(this.shape, null, false, null, true);
        },

        clearRect: function(x, y, width, height, color) {
            // TODO
        },

        drawRectShape: function(x, y, width, height) {
            var t = this.globalTransform;
            var dx = x - t.originalX;
            var dy = y - t.originalY;

            this.globalContainer.position.set(t.x + t.originalX, t.y + t.originalY);
            this.globalContainer.scale.set(t.scaleX, t.scaleY);
            this.globalContainer.rotation = t.rotation;
            this.globalContainer.alpha = t.alpha;
            this.globalContainer.updateTransformWithParent();

            this.shape.mask = this.mask;
            this.shape.drawRect(dx, dy, width, height);
        },

        drawDisplayObject: function(displayObject, dx, dy, dw, dh) {
            var count = arguments.length;
            if (count === 5) {
                // dx, dy, dw, dh
                displayObject.width = dw;
                displayObject.height = dh;
            } else if (count === 3) {
                // dx, dy
            }
            if (window.test) {
                // debugger;
            }
            this.doDraw(displayObject, dx, dy);
        },

        drawSimpleDisplayObject: function(displayObject, dx, dy, dw, dh) {
            var count = arguments.length;
            if (count === 5) {
                // dx, dy, dw, dh
                displayObject.width = dw;
                displayObject.height = dh;
            } else if (count === 3) {
                // dx, dy
            }
            this.doDraw(displayObject, dx, dy);
        },

        doDraw: function(displayObject, x, y) {
            var t = this.globalTransform;
            var dx = x - t.originalX;
            var dy = y - t.originalY;

            this.globalContainer.position.set(t.x + t.originalX, t.y + t.originalY);
            this.globalContainer.scale.set(t.scaleX, t.scaleY);
            this.globalContainer.rotation = t.rotation;
            this.globalContainer.alpha = t.alpha;
            this.globalContainer.updateTransformWithParent();

            displayObject.mask = this.mask;
            displayObject.position.set(dx, dy);

            this.core.renderBasic(displayObject);
        },

        drawImage: function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
            var displayObject;
            var count = arguments.length;
            if (count === 9) {
                displayObject = this.createDisplayObject(image, sx, sy, sw, sh);
                this.drawDisplayObject(displayObject, dx, dy, dw, dh);
            } else if (count === 3) {
                displayObject = this.createDisplayObject(image, 0, 0, image.width, image.height);
                // dx, dy
                this.drawDisplayObject(displayObject, sx, sy);
            } else {
                displayObject = this.createDisplayObject(image, 0, 0, image.width, image.height);
                // dx, dy, dw, dh
                this.drawDisplayObject(displayObject, sx, sy, sw, sh);
            }
            return displayObject;
        },

        save: function() {
            var t = this.globalTransform;
            this.stack.push({
                x: t.x,
                y: t.y,
                scaleX: t.scaleX,
                scaleY: t.scaleY,
                rotation: t.rotation,
                alpha: t.alpha,
                originalX: t.originalX,
                originalY: t.originalY,
            });
        },
        restore: function() {
            var lt = this.stack.pop();
            if (!lt) {
                return;
            }
            var t = this.globalTransform;
            t.x = lt.x;
            t.y = lt.y;
            t.scaleX = lt.scaleX;
            t.scaleY = lt.scaleY;
            t.rotation = lt.rotation;
            t.alpha = lt.alpha;
            t.originalX = lt.originalX;
            t.originalY = lt.originalY;
        },
        translate: function(x, y) {
            this.globalTransform.x += x;
            this.globalTransform.y += y;
        },
        scale: function(x, y) {
            this.globalTransform.scaleX *= x;
            this.globalTransform.scaleY *= y;
        },
        rotate: function(rotation) {
            this.globalTransform.rotation += rotation;
        },
        setAlpha: function(alpha) {
            this.globalTransform.alpha = alpha === undefined ? 1 : alpha;
        },
        getAlpha: function() {
            return this.globalTransform.alpha;
        },
        setOriginal: function(x, y) {
            this.globalTransform.originalX = x;
            this.globalTransform.originalY = y;
        },

        clipRect: function(x, y, width, height) {
            var _core = this.core;

            var t = this.globalTransform;
            var dx = x - t.originalX;
            var dy = y - t.originalY;

            // this.globalContainer.position.set(t.x + t.originalX, t.y + t.originalY);
            // this.globalContainer.scale.set(t.scaleX, t.scaleY);
            // this.globalContainer.rotation = t.rotation;
            // this.globalContainer.updateTransformWithParent(true, false);

            this.maskShape.updateTransform();
            this.maskShape.beginFill(0x000000);
            this.maskShape.drawRect(dx, dy, width, height);
            this.maskShape.endFill();

            this.mask = this.maskShape;

            return _core;
        },
        doClipRect: function(x, y, width, height) {
            this.mask = this.maskShape;
            return this.clipRect(x, y, width, height);
        },
        undoClipRect: function() {
            this.maskShape.clear();
            this.mask = null;
        },

        setBlend: function(blend) {
            this._lastBlend = this.blend;

            this.blend = blend;
            // TODO;
        },

        baseTexturePool: null,
        createBaseTexture: function(img) {
            var id = img.id || img.src;
            var baseTexture;
            if (id) {
                baseTexture = this.baseTexturePool[id];
                if (!baseTexture) {
                    baseTexture = new PIXI.BaseTexture(img);
                    this.baseTexturePool[id] = baseTexture;
                }
            } else {
                baseTexture = new PIXI.BaseTexture(img);
            }
            return baseTexture;
        },
        texturePool: null,
        createTexture: function(imgInfo, useCache) {
            var img = imgInfo.img;
            var baseTexture = this.createBaseTexture(img);
            var rect = new PIXI.Rectangle(imgInfo.sx, imgInfo.sy, imgInfo.sw, imgInfo.sh);
            var texture;
            if (useCache) {
                var id = imgInfo.id;
                texture = this.texturePool[id];
                if (!texture) {
                    texture = new PIXI.Texture(baseTexture, rect);
                    this.texturePool[id] = texture;
                }
            } else {
                texture = new PIXI.Texture(baseTexture, rect);
            }
            return texture;
        },

        createSprite: function(imgInfo) {
            var texture = this.createTexture(imgInfo, true);
            var sprite = PIXI.Sprite.from(texture);
            return sprite;
        },

    });

    exports.PIXIRenderer = PIXIRenderer;

    if (typeof module != "undefined") {
        module.exports = PIXIRenderer;
    }

}(CUI));
