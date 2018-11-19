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
