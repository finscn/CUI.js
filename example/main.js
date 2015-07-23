var Config = {
    width: 560,
    height: 400,
    FPS: 30,
};

var game = {};
var canvas, context;
var loopId;

var Component = CUI.Component;
var Label = CUI.Label;
var Button = CUI.Button;
var ScrollArea = CUI.ScrollArea;
var Utils = CUI.Utils;

window.onload = function() {
    init();

    CUI.Utils.loadImage("./res/btn-bg.png", function(img) {
        Images["btn-bg"] = img;
        CUI.Utils.loadImage("./res/btn-icon.png", function(img) {
            Images["btn-icon"] = img;
            start();
        });
    });
};


function beforeStart(timeStep, now) {
    initUI();
    rootUI.computeLayout();
}

function update(timeStep, now) {
    TWEEN.update();

    if (TouchInfo.firstTap) {
        var data = TouchInfo.firstTap;
        rootUI.checkTouch("onTap", data.x, data.y, data.id);
        TouchInfo.firstTap = null;
    } else if (TouchInfo.firstStart) {
        var data = TouchInfo.firstStart;
        rootUI.checkTouch("onTouchStart", data.x, data.y, data.id);
        TouchInfo.firstStart = null;
    } else if (TouchInfo.firstEnd) {
        var data = TouchInfo.firstEnd;
        rootUI.checkTouch("onTouchEnd", data.x, data.y, data.id);
        TouchInfo.firstEnd = null;
    } else if (TouchInfo.firstPan) {
        var data = TouchInfo.firstPan;
        rootUI.checkTouch("onPan", data.x, data.y,data.dx,data.dy,data.sx,data.sy, data.id);
        TouchInfo.firstPan = null;
    } else if (TouchInfo.firstSwipe) {
        var data = TouchInfo.firstSwipe;
        rootUI.checkTouch("onSwipe", data.x, data.y,data.vx,data.vy,data.sx,data.sy, data.id);
        TouchInfo.firstSwipe = null;
    }
    rootUI.update(timeStep,now);
    // uiX+=1;
    // topUI.setPosition(uiX,topUI.top);
    // topUI.moveBy(0.25,0);
}

function render(context, timeStep, now) {
    context.fillStyle = "rgba(0,0,0,1)";
    context.fillRect(0, 0, Config.width, Config.height);

    rootUI.render(context);

}

function init() {
    canvas = $id("canvas");
    canvas.width = Config.width;
    canvas.height = Config.height;
    context = canvas.getContext("2d");
    game.width = Config.width;
    game.height = Config.height;
    var rect = canvas.getBoundingClientRect();
    game.offsetX = rect.left;
    game.offsetY = rect.top;
    initTouchController();
    initTapListener();
    initPanListener();
    initSwipeListener();

}

var Images = {};

function start() {
    beforeStart();
    var staticTimeStep = 1000 / Config.FPS >> 0;
    loopId = setInterval(function() {
        var now = Date.now();
        var timeStep = staticTimeStep;
        update(timeStep, now);
        render(context, timeStep, now);
    }, staticTimeStep);
}


function $id(id) {
    return document.getElementById(id);
}
