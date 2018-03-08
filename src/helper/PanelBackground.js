"use strict";

var CUI = CUI || {};

(function(exports) {

    var Utils = exports.Utils;

    var PanelBackground = function(options, canvas) {

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
            padding: 0,

            borderWidth: 0,
            borderColor: "rgba(0,0,0,0)",

            shadowColor: "rgba(0,0,0,0)",
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBorderWidth: 0,
            shadowBorderColor: "rgba(0,0,0,0)",

            outerBorderWidth: 0,
            outerBorderColor: "rgba(0,0,0,0)",
            outerBorderRadius: null,

            headX: null,
            headY: null,
            headWidth: null,
            headHeight: null,
            headRadius: 8,
            headColor: "#3c3c2d",
            headBorderWidth: 0,
            headBorderColor: "#979778",
            headMarginTop: null,
            headMarginBottom: null,

            bodyX: null,
            bodyY: null,
            bodyWidth: null,
            bodyHeight: null,
            bodyRadius: 4,
            bodyColor: "#ff0000",
            bodyBorderWidth: 0,
            bodyBorderColor: "#d3c497",
            bodyPadding: 0,

            footX: null,
            footY: null,
            footWidth: 0,
            footHeight: 0,
            footRadius: 4,
            footColor: "#3c3c2d",
            footBorderWidth: 0,
            footBorderColor: "#979778",
            footMarginTop: null,
            footMarginBottom: null,

            innerX: null,
            innerY: null,
            innerWidth: null,
            innerHeight: null,
            innerRadius: 4,
            innerColor: "#f1e2d3",
            innerBorderWidth: 0,
            innerBorderColor: "#d3c497",

        }, options);

        var width = options.width;
        var height = options.height;
        var margin = options.margin;

        var mode = options.mode;
        var lineCap = options.lineCap;

        this.width = width;
        this.height = height;

        var padding = options.padding;
        var shadowOffsetX = options.shadowOffsetX;
        var shadowOffsetY = options.shadowOffsetY;
        var outerBorderWidth = options.outerBorderWidth;
        var outerBorderRadius = options.outerBorderRadius;

        var x = options.x + outerBorderWidth;
        var y = options.y + outerBorderWidth;

        var panelWidth = width - margin * 2 - shadowOffsetX - outerBorderWidth * 2;
        var panelHeight = height - margin * 2 - shadowOffsetY - outerBorderWidth * 2;

        var radius = Utils.fixRadius(options.radius);

        var bodyWidth = options.bodyWidth || panelWidth - padding * 2;
        var bodyHeight = options.bodyHeight || panelHeight;
        var bodyPadding = options.bodyPadding || 0;

        var headWidth = options.headWidth || panelWidth - padding * 2;
        var headHeight = options.headHeight || 0;
        var headMarginTop = options.headMarginTop === 0 || options.headMarginTop ? options.headMarginTop : padding;
        var headMarginBottom = options.headMarginBottom || 0;

        var footWidth = options.footWidth || panelWidth - padding * 2;
        var footHeight = options.footHeight || 0;
        var footMarginTop = options.footMarginTop || 0;
        var footMarginBottom = options.footMarginBottom === 0 || options.footMarginBottom ? options.footMarginBottom : padding;

        if (headHeight) {
            bodyHeight -= headMarginTop + headHeight + headMarginBottom
        } else {
            bodyHeight -= padding;
        }
        if (footHeight) {
            bodyHeight -= footMarginTop + footHeight + footMarginBottom
        } else {
            bodyHeight -= padding;
        }

        var ax = x;
        var ay = y;

        if (shadowOffsetX || shadowOffsetY) {
            this.shadow = {
                x: ax + options.shadowOffsetX,
                y: ay + options.shadowOffsetY,
                width: panelWidth,
                height: panelHeight,
                radius: radius,
                color: options.shadowColor,

                borderWidth: options.shadowBorderWidth,
                borderColor: options.shadowBorderColor,
            }
        }

        this.panel = {
            mode: mode,
            lineCap: lineCap,

            x: ax,
            y: ay,
            width: panelWidth,
            height: panelHeight,
            margin: margin,

            color: options.color,
            radius: radius,

            borderWidth: options.borderWidth,
            borderColor: 0,
        }

        ax += padding;

        ay += headMarginTop;

        if (options.headHeight) {
            var _width = options.headWidth || headWidth;
            var _height = options.headHeight || headHeight;
            var _x = options.headX === null ? panelWidth - _width >> 1 : options.headX;
            var _y = options.headY === null ? ay : options.headY;

            this.head = {
                mode: mode,
                lineCap: lineCap,

                x: _x,
                y: _y,
                width: _width,
                height: _height,

                color: options.headColor,
                radius: options.headRadius,
                borderWidth: options.headBorderWidth,
                borderColor: options.headBorderColor,
            }

            ay += _height + headMarginBottom;
        }

        if (options.bodyHeight || bodyHeight) {
            var _width = options.bodyWidth || bodyWidth;
            var _height = options.bodyHeight || bodyHeight;
            var _x = options.bodyX === null ? panelWidth - _width >> 1 : options.bodyX;
            var _y = options.bodyY === null ? ay : options.bodyY;

            this.body = {
                mode: mode,
                lineCap: lineCap,

                x: _x,
                y: _y,
                width: _width,
                height: _height,

                color: options.bodyColor,
                radius: options.bodyRadius,
                borderWidth: options.bodyBorderWidth,
                borderColor: options.bodyBorderColor,
            }

            if (options.innerColor) {

                var _width = options.innerWidth || (bodyWidth - bodyPadding * 2);
                var _height = options.innerHeight || (bodyHeight - bodyPadding * 2);

                var _x = options.innerX === null ? panelWidth - _width >> 1 : options.innerX;
                var _y = this.body.y + bodyPadding;
                _y = options.innerY === null ? _y : options.innerY;


                this.inner = {
                    mode: mode,
                    lineCap: lineCap,

                    x: _x,
                    y: _y,
                    width: _width,
                    height: _height,

                    color: options.innerColor,
                    radius: options.innerRadius,
                    borderWidth: options.innerBorderWidth,
                    borderColor: options.innerBorderColor,
                }
            }
        }

        if (options.footHeight) {
            var _width = options.footWidth || footWidth;
            var _height = options.footHeight || footHeight;

            var _x = options.footX === null ? panelWidth - _width >> 1 : options.footX;
            var _y = panelHeight - footMarginBottom - _height;
            _y = options.footY === null ? _y : options.footY;

            this.foot = {
                mode: mode,
                lineCap: lineCap,

                x: _x,
                y: _y,
                width: _width,
                height: _height,

                color: options.footColor,
                radius: options.footRadius,
                borderWidth: options.footBorderWidth,
                borderColor: options.footBorderColor,
            }
        }


        if (options.borderWidth) {
            this.border = {
                mode: mode,
                lineCap: lineCap,

                x: x,
                y: y,
                width: panelWidth,
                height: panelHeight,
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
                width: panelWidth + shadowOffsetX + outerBorderWidth * 2,
                height: panelHeight + shadowOffsetY + outerBorderWidth * 2,
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
        constructor: PanelBackground,

        init: function() {
            var rects = [
                this.shadow,
                this.panel,

                this.head,
                this.body,
                this.inner,
                this.foot,

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
        PanelBackground.prototype[p] = proto[p];
    }

    exports.PanelBackground = PanelBackground;

    if (typeof module !== "undefined") {
        module.exports = PanelBackground;
    }

}(CUI));
