"use strict";

var controller;

var TouchInfo = {
    multi: 2,
    reset: function() {
        this.touched = false;

        this.start = {};
        this.move = {};
        this.end = {};
        this.tap = {};
        this.pan = {};
        this.swipe = {};

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
    if (game) {
        controller.pixelRatio = game.pixelRatio || 1;
        controller.offsetX = -(game.offsetX || 0);
        controller.offsetY = -(game.offsetY || 0);
    }
    return controller;
};

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////


var initTapListener = function() {

    var tap = new Toucher.Tap({

        maxTimeLag: 400,
        maxDistance: 15,

        filterWrapper: function(type, wrapper, event, controller) {
            // return wrapper.target.tagName == "CANVAS";
            return true
        },
        start: function(wrappers, event, controller) {
            TouchInfo.touched = true;

            var index = 0;
            var count = Math.min(wrappers.length, this.multi);
            for (var i = 0; i < count; i++) {
                var wrapper = wrappers[i];
                var x = wrapper.pageX;
                var y = wrapper.pageY;
                if (this.onTouchStart != null) {
                    this.onTouchStart(x, y, wrapper, event, controller);
                }
            }

        },
        onTouchStart: function(x, y, wrapper, event, controller) {
            if (game.domUI) {
                var rs = game.domUI.onTouchStart(event);
                console.log("onTouchStart", rs)
                if (rs) {
                    return;
                }
            }

            TouchInfo.start[wrapper.id] = {
                id: wrapper.id,
                x: x,
                y: y,
                time: wrapper.startTime
            };

            if (TouchInfo.firstStart === null) {
                TouchInfo.firstStart = TouchInfo.start[wrapper.id];
            }
            if (TouchInfo.firstId === null) {
                TouchInfo.firstId = wrapper.id;
                TouchInfo.firstX = x;
                TouchInfo.firstY = y;
            }

        },

        end: function(wrappers, event, controller) {
            TouchInfo.touched = false;

            var index = 0;
            var count = Math.min(wrappers.length, this.multi);
            for (var i = 0; i < count; i++) {
                var wrapper = wrappers[i];
                var x = wrapper.endPageX;
                var y = wrapper.endPageY;
                if (this.onTouchEnd != null) {
                    this.onTouchEnd(x, y, wrapper, event, controller);
                }
                if (this.checkMoveDistance(wrapper) && this.checkTimeLag(wrapper)) {
                    wrapper.index = index++;
                    this.onTap(x, y, wrapper, event, controller);
                }
            }

        },

        onTouchEnd: function(x, y, wrapper, event, controller) {
            if (game.domUI) {
                var rs = game.domUI.onTouchEnd(event);
                console.log("onTouchEnd", rs)
                if (rs) {
                    return false;
                }
            }

            var id = wrapper.id;
            delete TouchInfo.start[id];
            delete TouchInfo.pan[id];
            if (TouchInfo.firstId === id) {
                TouchInfo.firstId = null;
                TouchInfo.firstX = null;
                TouchInfo.firstY = null;
            }

            TouchInfo.end[id] = {
                id: id,
                x: x,
                y: y,
                time: wrapper.endTime
            };

            if (TouchInfo.firstEnd === null) {
                TouchInfo.firstEnd = TouchInfo.end[id];
            }
        },

        onTap: function(x, y, wrapper, event, controller) {

            if (game.domUI) {
                var rs = game.domUI.onTouchTap(event);
                var rs2 = game.domUI.onTouchEnd(event);
                console.log("onTap", rs || rs2)
                if (rs || rs2) {
                    return false;
                }
            }

            TouchInfo.tap[wrapper.id] = {
                id: wrapper.id,
                x: x,
                y: y,
                time: wrapper.endTime
            };

            if (TouchInfo.firstTap === null) {
                TouchInfo.firstTap = TouchInfo.tap[wrapper.id];
            }
        },

    });
    controller.addListener(tap);
    return tap;
};

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////


var initPanListener = function() {

    var pan = new Toucher.Pan({

        filterWrapper: function(type, wrapper, event, controller) {
            return wrapper.target.tagName == "CANVAS";
        },

        onPan: function(dx, dy, x, y, wrapper, event, controller) {
            var pan = TouchInfo.pan[wrapper.id] = TouchInfo.pan[wrapper.id] || {
                id: wrapper.id,
                dx: 0,
                dy: 0
            };
            pan.time = wrapper.moveTime;
            pan.x = x;
            pan.y = y;
            pan.sx = wrapper.startPageX;
            pan.sy = wrapper.startPageY;
            // pan.dx += dx;
            // pan.dy += dy;
            pan.dx = dx;
            pan.dy = dy;

            if (TouchInfo.firstPan === null) {
                TouchInfo.firstPan = TouchInfo.pan[wrapper.id];
            }
            if (TouchInfo.firstId === wrapper.id) {
                TouchInfo.firstX = x;
                TouchInfo.firstY = y;
            }
        }
    });
    controller.addListener(pan);
    return pan;

};

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////


var initSwipeListener = function() {

    var swipe = new Toucher.Swipe({
        minDistance: 4,
        maxTime: 810,
        multi: 2,
        filterWrapper: function(type, wrapper, event, controller) {
            return wrapper.target.tagName == "CANVAS";
        },
        onSwipe: function(velX, velY, wrapper, event, controller) {
            TouchInfo.swipe[wrapper.id] = {
                id: wrapper.id,
                sx: wrapper.startPageX,
                sy: wrapper.startPageY,
                vx: velX,
                vy: velY,
                time: wrapper.endTime,
            }
            if (TouchInfo.firstSwipe === null) {
                TouchInfo.firstSwipe = TouchInfo.swipe[wrapper.id];
            }
        }
    });
    controller.addListener(swipe);
    return swipe;

};

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var joystick;
var JoystickConfig = {
    dynamic: true, // true,
    sensitive: true, // true,
    maxMoveRadius: 110,
    minMoveRadius: 10,
    followSpeed: 0.05, // 0.05
    followDistance: 60, // 80,
    warningEdge: 0, //60
};

var initJoystick = function() {

    joystick = new Toucher.Joystick({
        disabled: false,
        // touchRegion: null,
        touchRegion: [0, 100, game.width, game.height],
        wayCount: null,
        stickX: 150,
        stickY: game.height - 150,
        defaultStickX: 150,
        defaultStickY: game.height - 150,

        minMoveRadius: JoystickConfig.minMoveRadius,
        maxMoveRadius: JoystickConfig.maxMoveRadius,

        dynamic: JoystickConfig.dynamic,
        followSpeed: JoystickConfig.followSpeed, // 0 is not follow
        followDistance: JoystickConfig.followDistance,
        warningEdge: JoystickConfig.warningEdge

    });

    controller.addListener(joystick);
}
