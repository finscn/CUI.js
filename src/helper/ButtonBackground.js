"use strict";

var CUI = CUI || {};

(function(exports) {

    var Utils = exports.Utils;

    var ButtonBackground = function(options, canvas) {

        options = Object.assign({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            margin: 0,

            mode: 0,
            lineCap: 'round',

            color: null,
            radius: 0,

            borderWidth: 0,
            borderColor: "rgba(0,0,0,0)",

            //////////////////////////////
            //  extras //
            //////////////////////////////

            lightColor: "rgba(0,0,0,0)",
            lightWidth: 0,
            lightHeight: 0,
            lightRadius: 0,
            lightOffsetX: 0,
            lightOffsetY: 0,

            lighterColor: "rgba(0,0,0,0)",
            lighterWidth: 0,
            lighterHeight: 0,
            lighterRadius: 0,

            darkerColor: "rgba(0,0,0,0)",
            darkerHeight: 0,
            darkerRadius: 0,
            darkerOffsetY: 0,
            darkerOffsetX: 0,

            shadowColor: "rgba(0,0,0,0)",
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBorderWidth: 0,
            shadowBorderColor: "rgba(0,0,0,0)",

            outerBorderWidth: 0,
            outerBorderColor: "rgba(0,0,0,0)",
            outerBorderRadius: null,
        }, options);

        var width = options.width;
        var height = options.height;
        var margin = options.margin;

        var mode = options.mode;
        var lineCap = options.lineCap;

        this.width = width;
        this.height = height;

        var shadowOffsetX = options.shadowOffsetX;
        var shadowOffsetY = options.shadowOffsetY;
        var outerBorderWidth = options.outerBorderWidth;
        var outerBorderRadius = options.outerBorderRadius;

        var x = options.x + outerBorderWidth;
        var y = options.y + outerBorderWidth;

        var buttonWidth = width - margin * 2 - shadowOffsetX - outerBorderWidth * 2;
        var buttonHeight = height - margin * 2 - shadowOffsetY - outerBorderWidth * 2;

        var radius = Utils.fixRadius(options.radius);

        if (shadowOffsetX || shadowOffsetY) {
            this.shadow = {
                x: x + options.shadowOffsetX,
                y: y + options.shadowOffsetY,
                width: buttonWidth,
                height: buttonHeight,
                radius: radius,
                color: options.shadowColor,

                borderWidth: options.shadowBorderWidth,
                borderColor: options.shadowBorderColor,
            }
        }

        this.button = {
            mode: mode,
            lineCap: lineCap,

            x: x,
            y: y,
            width: buttonWidth,
            height: buttonHeight,
            margin: margin,

            color: options.color,
            radius: radius,

            borderWidth: options.borderWidth,
            borderColor: 0,
        }

        if (options.darkerColor) {
            var ox = options.darkerOffsetX;
            var oy = options.darkerOffsetY;
            ox = ox < 0 ? buttonWidth + ox : ox;
            oy = oy < 0 ? buttonHeight + oy : oy;
            this.darker = {
                mode: mode,
                lineCap: lineCap,

                x: x + ox,
                y: y + oy,
                width: buttonWidth,
                height: options.darkerHeight,
                radius: [0, 0, radius[2], radius[3]],
                color: options.darkerColor,
            }
        }

        if (options.lightColor) {
            var ox = options.lightOffsetX;
            var oy = options.lightOffsetY;
            ox = ox < 0 ? buttonWidth + ox : ox;
            oy = oy < 0 ? buttonHeight + oy : oy;
            this.light = {
                mode: mode,
                lineCap: lineCap,

                x: x + ox,
                y: y + oy,
                width: options.lightWidth || buttonWidth,
                height: options.lightHeight || buttonHeight / 2,
                radius: [radius[0], radius[1], 0, 0],
                color: options.lightColor,
            }
        }

        if (options.lighterColor) {
            var ox = options.lightOffsetX;
            var oy = options.lightOffsetY;
            ox = ox < 0 ? buttonWidth + ox : ox;
            oy = oy < 0 ? buttonHeight + oy : oy;
            this.lighter = {
                mode: mode,
                lineCap: lineCap,

                x: x + ox,
                y: y + oy,
                width: options.lighterWidth || buttonWidth,
                height: options.lighterHeight,
                radius: [radius[0], radius[1], 0, 0],
                color: options.lighterColor,
            }
        }

        if (options.borderWidth) {
            this.border = {
                mode: mode,
                lineCap: lineCap,

                x: x,
                y: y,
                width: buttonWidth,
                height: buttonHeight,
                radius: radius,
                color: null,

                borderWidth: options.borderWidth,
                borderColor: options.borderColor,
            }
        }

        if (outerBorderWidth) {
            if (!outerBorderRadius && outerBorderRadius !== 0) {
                outerBorderRadius = [
                    radius[0] ? radius[0] + outerBorderWidth : 0,
                    radius[1] ? radius[1] + outerBorderWidth : 0,
                    radius[2] ? radius[2] + outerBorderWidth : 0,
                    radius[3] ? radius[3] + outerBorderWidth : 0,
                ]
            }

            this.outerBorder = {
                mode: mode,
                lineCap: lineCap,

                x: x - outerBorderWidth,
                y: y - outerBorderWidth,
                width: buttonWidth + shadowOffsetX + outerBorderWidth * 2,
                height: buttonHeight + shadowOffsetY + outerBorderWidth * 2,
                radius: outerBorderRadius || outerBorderRadius === 0 ? outerBorderRadius : radius,
                color: null,

                borderWidth: options.outerBorderWidth,
                borderColor: options.outerBorderColor,
            }
        }

        this.canvas = canvas;
        this.init();
    };

    var proto = {
        constructor: ButtonBackground,

        init: function() {
            var rects = [
                this.shadow,
                this.button,
                this.darker,
                this.light,
                this.lighter,
                this.border,
                this.outerBorder,
            ];

            var canvas = this.canvas || Utils.createCanvas(this.width, this.height);

            // var context = canvas.getContext('2d');
            // context.fillRect(0, 0, canvas.width, canvas.height);

            var img = Utils.createRoundRects(this.width, this.height, rects, canvas);

            this.image = img;
        },

    };

    for (var p in proto) {
        ButtonBackground.prototype[p] = proto[p];
    }

    exports.ButtonBackground = ButtonBackground;

    if (typeof module !== "undefined") {
        module.exports = ButtonBackground;
    }

}(CUI));
