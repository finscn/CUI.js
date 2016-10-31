"use strict";

var GT = GT || {};
var controller;

var TouchInfo = {
    multi: 2,
    touched: 0,
    reset: function() {
        this.touched = 0;

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
        this.pinch = null;
    },
};
TouchInfo.reset();


var initTouchController = function() {
    controller = new Toucher.Controller({
        beforeInit: function() {
            this.dom = document;
        },
        // pixelRatio: Config.touchPixelRatio,
        // preventDefaultStart: true,
        preventDefaultMove: true,
        // preventDefaultEnd: true,
        moveInterval: 0,
        pixelRatio: 1,
    });
    controller.init();
    if (game && game.updateController) {
        game.updateController(controller);
    }
    return controller;
};

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////


var initTapListener = function() {

    var tap = new Toucher.Tap({

        maxTimeLag: 700,
        maxDistance: 40,

        filterWrapper: function(type, wrapper, event, controller) {
            // return wrapper.target.tagName == "CANVAS";
            return true
        },
        start: function(wrappers, event, controller) {
            TouchInfo.touched = Math.min(TouchInfo.touched + 1, 1);
            if (GT.Sound) {
                GT.Sound.touchLoad();
                GT.Sound.activateContext();
            }

            var index = 0;
            var count = Math.min(wrappers.length, this.multi);
            for (var i = 0; i < count; i++) {
                var wrapper = wrappers[i];
                var x = wrapper.pageX;
                var y = wrapper.pageY;
                if (wrapper.target.tagName == "CANVAS"){
                    event.preventDefault();
                }
                if (this.onTouchStart != null) {
                    this.onTouchStart(x, y, wrapper, event, controller);
                }
            }

        },
        onTouchStart: function(x, y, wrapper, event, controller) {
            if (game.domUI) {
                var rs = game.domUI.onTouchStart(event);
                // console.log("onTouchStart", rs)
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
            TouchInfo.touched = Math.max(TouchInfo.touched - 1, 0);
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

        cancel: function(wrappers, event, controller) {
            TouchInfo.touched = 0;
            controller.reset();
        },

        onTouchEnd: function(x, y, wrapper, event, controller) {
            if (game.domUI) {
                var rs = game.domUI.onTouchEnd(event);
                // console.log("onTouchEnd", rs)
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
                // console.log("onTap", rs || rs2)
                if (rs || rs2) {
                    return false;
                }
            }

            TouchInfo.tap[wrapper.id] = {
                id: wrapper.id,
                x: x,
                y: y,
                time: wrapper.endTime,
                duration: wrapper.endTime - wrapper.startTime,
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

        filterWrappers: function(type, wrappers, event, controller) {
            if (wrappers.length > 1) {
                return false;
            }
            return true;
        },
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
            pan.dx += dx;
            pan.dy += dy;
            // pan.dx = dx;
            // pan.dy = dy;

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
        maxTime: 900,
        multi: 2,
        filterWrappers: function(type, wrappers, event, controller) {
            if (wrappers.length > 1) {
                return false;
            }
            return true;
        },
        filterWrapper: function(type, wrapper, event, controller) {
            return wrapper.target.tagName == "CANVAS";
        },
        onSwipe: function(velX, velY, wrapper, event, controller) {
            TouchInfo.swipe[wrapper.id] = {
                id: wrapper.id,
                x: wrapper.pageX,
                y: wrapper.pageY,
                sx: wrapper.startPageX,
                sy: wrapper.startPageY,
                vx: velX,
                vy: velY,
                time: wrapper.endTime,
                duration: wrapper.endTime - wrapper.startTime,
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

var initPinchListener = function() {

    var pinch = new Toucher.Pinch({
        minDistance: 4,
        maxTime: 810,
        multi: 2,
        filterWrapper: function(type, wrapper, event, controller) {
            return wrapper.target.tagName == "CANVAS";
        },
        onPinch: function(distance, lastDistance, startDistance, centerPoint, wrappers, event, controller) {
            var wrapper = wrappers[0];
            TouchInfo.pinch = {
                distance: distance,
                lastDistance: lastDistance,
                startDistance: startDistance,
                centerX: centerPoint[0],
                centerY: centerPoint[1],
            }
        },
        onPinchEnd: function() {
            TouchInfo.pinch = null;
        }
    });
    controller.addListener(pinch);
    return pinch;

};


///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////


var TouchStickConfig = {
    floating: false, // true,
    sensitive: true, // true,
    maxMoveRadius: 100,
    minMoveRadius: 20,
    followSpeed: 0, // 0.05
    followDistance: 60, // 80,
    warningEdge: 0, //60
    left: 60,
    bottom: 460,
};

var initTouchStick = function(cfg) {
    cfg = cfg || {};
    for (var p in TouchStickConfig) {
        if (!(p in cfg)) {
            cfg[p] = TouchStickConfig[p];
        }
    }

    // var screenWidth = game.scaler.validWidth;
    // var screenHeight = game.scaler.validHeight;

    var screenWidth = game.scaler.fullWidth;
    var screenHeight = game.scaler.fullHeight;

    // console.log("initTouchStick 1 : ", game.scaler.validWidth, game.offsetX);
    // console.log("initTouchStick 2 : ", game.scaler.validHeight, game.offsetY);

    var x = 0 + cfg.left + cfg.maxMoveRadius;
    var y = screenHeight - cfg.bottom - cfg.maxMoveRadius;
    var btn = new Toucher.TouchStick({
        disabled: false,
        // touchRegion: null,
        touchRegion: [0, 150, screenWidth >> 1, screenHeight],
        wayCount: null,
        x: x,
        y: y,
        defaultX: x,
        defaultY: y,

        minMoveRadius: cfg.minMoveRadius,
        maxMoveRadius: cfg.maxMoveRadius,

        sensitive: cfg.sensitive,
        floating: cfg.floating,
        followSpeed: cfg.followSpeed, // 0 is not follow
        followDistance: cfg.followDistance,
        warningEdge: cfg.warningEdge,

    });
    return btn;
};


var TouchButtonConfig = {
    width: 100,
    height: 100,
    right: null,
    bottom: null,
};

var initTouchButton = function(cfg) {
    cfg = cfg || {};
    for (var p in TouchButtonConfig) {
        if (!(p in cfg)) {
            cfg[p] = TouchButtonConfig[p];
        }
    }

    // console.log(game.scaler);

    // var screenWidth = game.scaler.validWidth;
    // var screenHeight = game.scaler.validHeight;

    var screenWidth = game.scaler.fullWidth;
    var screenHeight = game.scaler.fullHeight;


    var x = cfg.x || 0;
    if (cfg.left || cfg.left === 0) {
        x = cfg.left + cfg.width / 2;
    } else if (cfg.right || cfg.right === 0) {
        x = screenWidth - cfg.width / 2 - cfg.right;
    }
    x += game.scaler.validX;
    // x += Math.max(0, game.scaler.validX);


    var y = cfg.y || 0;
    if (cfg.top || cfg.top === 0) {
        y = cfg.top + cfg.height / 2;
    } else if (cfg.bottom || cfg.bottom === 0) {
        y = screenHeight - cfg.height / 2 - cfg.bottom;
    }
    y += game.scaler.validY;
    // y += Math.max(0, game.scaler.validY);


    var btn = new Toucher.TouchButton({
        name: cfg.name,
        disabled: false,
        x: cfg.x || x,
        y: cfg.y || y,
        width: cfg.width,
        height: cfg.height,
    });
    return btn;

};


var initGamepadButton = function(cfg) {
    var btn = new GT.GamepadButton({
        name: cfg.name,
        buttonIndex: cfg.buttonIndex,
        axesIndex: cfg.axesIndex,
    });
    return btn;
};

var initGameKeyButton = function(cfg) {
    var btn = new GT.GameKeyButton({
        name: cfg.name,
        key: cfg.key,
    });
    return btn;
};
