"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;

    var PIXIRenderer = Class.create({

        antialias: false,
        transparent: true,
        backgroundColor: 0x000000,

        webgl: null,

        initialize: function() {
            this.lazyInit = false;
            this.core = null;
            this.renderer = null;
            this.canvas = null;
            this.context = null;
            this.clearColor = null;
            this.webgl = false;

            this.origX = 0;
            this.origY = 0;
            this.root = null;
            this.globalContainer = null;
        },

        init: function() {

            if (!this.core) {
                var renderer = this.renderer;
                if (!renderer) {
                    var canvas = this.canvas;
                    var options = {
                        width: canvas.width,
                        height: canvas.height,
                        view: canvas,
                        antialias: this.antialias,
                        transparent: this.transparent,
                        backgroundColor: this.backgroundColor,
                        clearBeforeRender: false,
                    };
                    if (this.webgl === false) {
                        renderer = new PIXI.CanvasRenderer(options);
                    } else if (this.webgl === true) {
                        renderer = new PIXI.WebGLRenderer(options);
                    } else {
                        renderer = new PIXI.autoDetectRenderer(options);
                    }
                    renderer.resize(canvas.width, canvas.height);
                    // renderer.backgroundColor = this.clearColor || 0;
                }
                this.core = new PIXI.RenderContext(renderer, this.root);
            } else {
                this.canvas = this.core.renderer.view;
            }
            this.context = this.core.renderer.gl || this.core.renderer.rootContext;
            this.webgl = this.core.webgl;
            this.canvas2d = !this.webgl;
            this.root = this.core.root;
            this.globalContainer = this.core.globalContainer;

            this.origX = 0;
            this.origY = 0;

            this.renderNineSliceObject = this.drawDisplayObject;
        },

        begin: function(clear) {
            this.core.begin(clear);
        },
        end: function() {
            this.core.end();
        },

        colorRgb: function(r, g, b) {
            return this.core.colorRgb(r, g, b);
        },
        colorHex: function(value) {
            return this.core.colorHex(value);
        },
        colroName: function(value) {
            return this.core.colroName(value);
        },

        /**
         *
         *
         *
         *
         *
         *
         **/

        save: function() {
            this.core.save();
        },
        restore: function() {
            this.core.restore();
        },
        translate: function(x, y) {
            this.core.translate(x, y);
        },
        scale: function(x, y) {
            this.core.scale(x, y);
        },
        rotate: function(rotation) {
            this.core.rotate(rotation);
        },
        setAlpha: function(alpha) {
            this.core.setAlpha(alpha);
        },
        restoreAlpha: function() {
            this.core.restoreAlpha();
        },
        getAlpha: function() {
            return this.core.getAlpha();
        },
        setOrigin: function(x, y) {
            this.core.setOrigin(x, y);
        },
        getOrigin: function() {
            return this.core.getOrigin();
        },
        clipRect: function(x, y, width, height) {
            this.core.clipRect(x, y, width, height);
        },
        unclipRect: function() {
            this.core.unclipRect();
        },
        setBlendByName: function(name) {
            this.core.setBlendByName(name);
        },
        getBlend: function() {
            return this.core.getBlend();
        },
        setBlend: function(blend) {
            this.core.setBlend(blend);
        },
        restoreBlend: function() {
            this.core.restoreBlend();
        },
        resetGlobalContainer: function() {
            this.core.resetGlobalContainer();
        },

        /**
         *
         *
         *
         *
         *
         *
         **/

        clear: function() {
            this.core.clear(this.clearColor);
        },

        strokeRect: function(x, y, width, height, lineWidth, color) {
            this.core.strokeRect(x, y, width, height, lineWidth, color);
        },

        fillRect: function(x, y, width, height, color) {
            this.core.fillRect(x, y, width, height, color);
        },

        clearRect: function(x, y, width, height) {
            this.core.clearRect(x, y, width, height, this.clearColor, 1);
        },

        strokeText: function(text, x, y, lineWidth, color, style) {
            this.core.strokeText(text, x, y, lineWidth, color, style);
        },

        fillText: function(text, x, y, color, style) {
            this.core.fillText(text, x, y, color, style);
        },

        drawText: function(text, x, y, style) {
            this.core.drawText(text, x, y, style);
        },

        drawDisplayObject: function(displayObject, dx, dy, dw, dh) {
            if (arguments.length === 5) {
                displayObject.width = dw;
                displayObject.height = dh;
                this.core.renderAt(displayObject, dx, dy);
            } else {
                this.core.renderAt(displayObject, dx, dy);
            }
        },

        render: function(displayObject) {
            this.core.render(displayObject);
        },

        renderAt: function(displayObject, dx, dy) {
            this.core.renderAt(displayObject, dx, dy);
        },

        drawImage: function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
            var count = arguments.length;
            if (count === 3) {
                // dx, dy
                this.core.drawImageAt(image, sx, sy);
            } else if (count === 9) {
                this.core.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
            } else {
                // dx, dy, dw, dh
                this.core.drawImage(image, sx, sy, sw, sh);
            }
        },

        renderNineSliceObject: null,

        /**
         *
         *
         *
         *
         *
         *
         **/

        createDisplayObject: function(image, sx, sy, sw, sh, container) {
            return this.core.createSprite.apply(this.core, arguments);
        },

        createTextObject: function(context, container) {
            return this.core.createTextObject(context, container);
        },

        createNineSliceObject: function(image, sx, sy, sw, sh, T, R, B, L, container) {
            if (arguments.length > 9) {
                return this.core.createNineSliceObject(image, sx, sy, sw, sh, L, T, R, B, container);
            }
            T = sx;
            R = sy;
            B = sw;
            L = sh;
            return this.core.createNineSliceObject(image, L, T, R, B, container);
        },

    });

    Object.defineProperty(PIXIRenderer.prototype, 'globalAlpha', {
        get: function get() {
            return this.core.globalAlpha;
        },

        set: function set(value) {
            this.core.globalAlpha = value;
        }
    });

    Object.defineProperty(PIXIRenderer.prototype, 'lineWidth', {
        get: function get() {
            return this.core.lineWidth;
        },

        set: function set(value) {
            this.core.lineWidth = value;
        }
    });

    Object.defineProperty(PIXIRenderer.prototype, 'strokeStyle', {
        get: function get() {
            return this.core.strokeStyle;
        },

        set: function set(value) {
            this.core.strokeStyle = value;
        }
    });

    Object.defineProperty(PIXIRenderer.prototype, 'fillStyle', {
        get: function get() {
            return this.core.fillStyle;
        },

        set: function set(value) {
            this.core.fillStyle = value;
        }
    });

    exports.PIXIRenderer = PIXIRenderer;

    if (typeof module !== "undefined") {
        module.exports = PIXIRenderer;
    }

}(CUI));
