// TODO

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Panel = exports.Panel;
    var Button = exports.Button;
    var Picture = exports.Picture;


    var SliderBar = Class.create({
        superclass: Panel,

        // track
        // handle

        // min
        // max
        // step
        // value

        initialize: function() {
            this.visible = true;
            this.disabled = false;

            this.vertical = false;
            this.inverted = false;

            this.min = 0;
            this.max = 100;
            this.step = 1;
            this.value = 50;

            this.handleInfo = null;
            this.trackInfo = null;
            this.trackLength = null;

            this.handle = null;
            this.track = null;
        },

        afterInit: function() {

            var Me = this;
            var trackInfo = this.trackInfo || {};
            var handleInfo = this.handleInfo || {};

            var options = {
                parent: Me,

                width: "100%",
                height: "70%",
                centerH: true,
                centerV: true,

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
                    var dx = x < Me.handle.x ? -1 : 1;
                    var dy = y < Me.handle.y ? -1 : 1;
                    console.log(dx, dy);
                    if (dx < 0) {
                        Me.scrollBy(-Me.stepPixel, 0);
                    } else if (dx > 0) {
                        Me.scrollBy(Me.stepPixel, 0);
                    }
                }
            };
            for (var p in trackInfo) {
                options[p] = trackInfo[p];
            }
            this.track = new Button(options);

            var options = {
                parent: Me,

                // width: 60,
                // height: "100%",
                centerH: true,
                centerV: true,

                // borderWidth: 2,

                pressX: null,
                pressY: null,
                touchStart: function(x, y, id) {
                    if (this.disabled) {
                        return false;
                    }
                    this.touchId = id;
                    this.pressX = x;
                    this.pressY = y;
                    this.scale = 0.95;
                },
                touchEnd: function(x, y, id) {
                    if (this.disabled) {
                        return false;
                    }
                    if (this.touchId === id) {
                        this.touchId = this.pressX = this.pressY = null;
                        this.scale = 1.0;
                    }
                    return false;
                },

                onTap: function(x, y, id) {
                    return true;
                },
                moveBy: function(dx, dy) {
                    var x = this.pixel.relativeX + dx;
                    var y = this.pixel.relativeY + dy;
                    x = Math.min(Math.max(Me.minX, x), Me.maxX);
                    y = Math.min(Math.max(Me.minY, y), Me.maxY);
                    // x = Math.round(x / Me.step) * Me.step;
                    // y = Math.round(y / Me.step) * Me.step;
                    this.pixel.relativeX = x;
                    this.pixel.relativeY = y;
                    // this.left = this.pixel.relativeX;
                    // this.top = this.pixel.relativeY;
                    this.syncPosition();
                },
            };
            for (var p in handleInfo) {
                options[p] = handleInfo[p];
            }
            this.handle = new Button(options);


            this.stepPixel = this.step;
            this.first = true;

        },
        update: function() {
            if (this.first) {
                this.first = false;
                this.updateTrack();
                this.setValue(this.value);
            }
        },

        scrollBy: function(dx, dy) {
            this.updateTrack();

            if (this.vertical) {
                this.handle.moveBy(0, dy);
            } else {
                this.handle.moveBy(dx, 0);
            }
            var p = this.handle.pixel.relativeX / this.trackRealSize;
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
            } else {
                this.handle.pixel.relativeX = dis;
            }
            this.handle.syncPosition();
        },

        updateTrack: function() {
            this.minX = 0;
            this.minY = 0;
            this.maxX = this._absoluteWidth - this.handle.w;
            this.maxY = this._absoluteHeight - this.handle.h;
            this.trackRealSize = this.vertical ? this.maxY : this.maxX;
        },

        pan: function(x, y, dx, dy, sx, sy, id) {
            if (!this.visible || !this.containPoint(x, y)) {
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
            console.log(value)
        },
        // onTouchStart: function(x, y, id) {
        //     if (this.containPoint(x, y)) {
        //         this.stopScroll();
        //     }
        //     return false;
        // },

        // onTouchEnd: function(x, y, id) {
        //     this.startTween();
        //     return false;
        // },

        // onPan: function(x, y, dx, dy, startX, startY, id) {
        //     if (this.containPoint(startX, startY)) {
        //         this.scrollBy(-dx, -dy);
        //         return;
        //     }
        //     return false;
        // },
    });

    exports.SliderBar = SliderBar;

}(CUI));
