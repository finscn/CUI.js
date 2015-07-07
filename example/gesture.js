"use strict";

var controller;


var TouchInfo = {
    multi: 1,
    reset: function() {
        this.touched = false;
        this.start = {};
        this.move = {};
        this.end = {};
        this.tap = {};
        // this.pan = {};
        // this.swipe = {};
        this.pan = null;
        this.swipe = null;

        this.firstStart = null;
        this.firstMove = null;
        this.firstEnd = null;
        this.firstTap = null;
        this.firstPan = null;
        this.firstSwipe = null;
        this.firstId = null;
        this.firstX = null;
        this.firstY = null;
    },
};
TouchInfo.reset();


var initTouchController = function() {
    controller = new Toucher.Controller({
        beforeInit: function() {
            this.dom = document;
        },
        // pixelRatio: Config.touchPixelRatio,
        preventDefaultMove: true,
        // preventDefaultEnd: true,
        moveInterval: 0,
        pixelRatio: 1,
    });
    controller.init();
    return controller;
};


var initTapListener = function() {

    var tap = new Toucher.Tap({

        maxTimeLag: 400,
        maxDistance: 15,

        filterWrapper: function(type, wrapper, event, controller) {
            return true
        },
        start: function(wrappers, event, controller) {
            TouchInfo.touched = true;

            var first = false;
            for (var i = 0; i < TouchInfo.multi; i++) {
                var w = wrappers[i];
                if (!w) {
                    break;
                }
                TouchInfo.start[w.id] = {
                    id: w.id,
                    x: w.pageX - game.offsetX,
                    y: w.pageY - game.offsetY,
                    time: w.startTime
                };
                if (!first) {
                    first = true;
                    TouchInfo.firstStart = TouchInfo.start[w.id];
                    if (TouchInfo.firstId === null) {
                        TouchInfo.firstId = TouchInfo.firstStart.id;
                        TouchInfo.firstX = TouchInfo.firstStart.x;
                        TouchInfo.firstY = TouchInfo.firstStart.y;
                    }
                }
            }
        },

        move: function(wrappers, event, controller) {
            var first = false;
            for (var i = 0; i < TouchInfo.multi; i++) {
                var w = wrappers[i];
                if (!w) {
                    break;
                }
                TouchInfo.move[w.id] = {
                    id: w.id,
                    x: w.pageX - game.offsetX,
                    y: w.pageY - game.offsetY,
                    dx: w.deltaX - game.offsetX,
                    dy: w.deltaY - game.offsetY,
                    sx: w.startPageX - game.offsetX,
                    sy: w.startPageY - game.offsetY,
                    time: w.moveTime
                };
                if (!first) {
                    first = true;
                    TouchInfo.firstMove = TouchInfo.move[w.id];
                    if (TouchInfo.firstId === w.id) {
                        TouchInfo.firstX = TouchInfo.firstMove.x;
                        TouchInfo.firstY = TouchInfo.firstMove.y;
                    }
                }
            }
        },

        end: function(wrappers, event, controller) {
            TouchInfo.touched = false;
            var first = false;
            var firstTap = false;
            for (var i = 0; i < TouchInfo.multi; i++) {
                var w = wrappers[i];
                if (!w) {
                    break;
                }
                TouchInfo.end[w.id] = {
                    id: w.id,
                    x: w.pageX - game.offsetX,
                    y: w.pageY - game.offsetY,
                    time: w.endTime
                };
                if (!first) {
                    first = true;
                    TouchInfo.firstEnd = TouchInfo.end[w.id];
                }
                if (TouchInfo.firstId === w.id) {
                    TouchInfo.firstId = null;
                    TouchInfo.firstX = null;
                    TouchInfo.firstY = null;
                }

                if (this.checkMoveDistance(w) && this.checkTimeLag(w)) {
                    TouchInfo.tap[w.id] = {
                        id: w.id,
                        x: w.pageX - game.offsetX,
                        y: w.pageY - game.offsetY,
                        time: w.endTime
                    };
                    if (!firstTap) {
                        firstTap = true;
                        TouchInfo.firstTap = TouchInfo.tap[w.id];
                    }
                }
            }
        },

    });
    controller.addListener(tap);
    return tap;
};

