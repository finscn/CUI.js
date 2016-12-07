"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;

    var PIXIRenderer = Class.create({

        lazyInit: false,

        core: null,
        renderer: null,
        canvas: null,
        context: null,
        clearColor: null,

        webgl: false,

        init: function() {

            if (!this.core) {
                var renderer = this.renderer;
                if (!renderer) {
                    var canvas = this.canvas;
                    // renderer = new PIXI.CanvasRenderer(canvas.width, canvas.height, {
                    //     view: canvas,
                    // });
                    renderer = new PIXI.WebGLRenderer(canvas.width, canvas.height, {
                        view: canvas,
                    });
                    this.webgl = renderer.type === PIXI.RENDERER_TYPE.WEBGL;
                    renderer.resize(canvas.width, canvas.height);
                    // renderer.backgroundColor = this.clearColor || 0;
                }
                this.core = new PIXI.RenderContext(renderer, this.root);
            } else {
                this.canvas = this.core.renderer.view;
            }
            this.webgl = this.core.webgl;
            this.root = this.core.root;
            this.globalContainer = this.core.globalContainer;

            this.render = this.drawDisplayObject;
            this.renderNineSliceObject = this.drawDisplayObject;
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
        getAlpha: function() {
            return this.core.getAlpha();
        },
        setOriginal: function(x, y) {
            this.core.setOriginal(x, y);
        },
        clipRect: function(x, y, width, height) {
            this.core.clipRect(x, y, width, height);
        },
        unclipRect: function() {
            this.core.unclipRect();
        },
        setBlend: function(blend) {
            this.core.setBlend(blend);
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

        strokeRect: function(x, y, width, height, color, lineWidth) {
            this.core.strokeRect(x, y, width, height, color, lineWidth);
        },

        fillRect: function(x, y, width, height, color) {
            this.core.fillRect(x, y, width, height, color);
        },

        clearRect: function(x, y, width, height) {
            this.core.clearRect(x, y, width, height, this.clearColor, 1);
        },

        drawDisplayObject: function(displayObject, dx, dy, dw, dh) {
            if (arguments.length === 5) {
                this.core.render(displayObject, dx, dy, dw, dh);
            } else {
                this.core.renderAt(displayObject, dx, dy);
            }
        },

        renderBasic: function(displayObject, renderTexture, skipUpdateTransform) {
            displayObject.mask = this.core.mask;
            this.core.renderer.renderBasic(displayObject, renderTexture, skipUpdateTransform);
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
            return this.core.createNineSliceObject.apply(this.core, arguments);
        },

    });

    exports.PIXIRenderer = PIXIRenderer;

    if (typeof module != "undefined") {
        module.exports = PIXIRenderer;
    }

}(CUI));
