var Config = {
    width: 640,
    height: 400,
    FPS: 60,

    pixi: null,
    webgl: null,
};

console.log("PIXI.js: " + Config.pixi);
console.log("WebGL: " + Config.webgl);

var game = {};
var canvas, context;
var loopId;

window.onload = function() {
    init();

    CUI.Utils.loadImages(
        [
            { id: "bg", src: "./res/bg.png" },
            { id: "btn-bg", src: "./res/btn-bg.png" },
            { id: "btn-icon", src: "./res/btn-icon.png" },
        ],
        function(imgPool) {
            for (var id in imgPool) {
                CUI.ImagePool[id] = imgPool[id];
            }
            start();
        }
    );
};


function beforeStart(timeStep, now) {
    initUI();
    rootUI.computeLayout();
}

function update(timeStep, now) {

    if (TouchInfo.firstTap) {
        var data = TouchInfo.firstTap;
        rootUI.checkTouch("tap", data.x, data.y, data.id);
        TouchInfo.firstTap = null;
    } else if (TouchInfo.firstStart) {
        var data = TouchInfo.firstStart;
        rootUI.checkTouch("touchStart", data.x, data.y, data.id);
        TouchInfo.firstStart = null;
    } else if (TouchInfo.firstEnd) {
        var data = TouchInfo.firstEnd;
        rootUI.checkTouch("touchEnd", data.x, data.y, data.id);
        TouchInfo.firstEnd = null;
    } else if (TouchInfo.firstPan) {
        var data = TouchInfo.firstPan;
        rootUI.checkTouch("pan", data.x, data.y, data.dx, data.dy, data.sx, data.sy, data.id);
        TouchInfo.firstPan = null;
    } else if (TouchInfo.firstSwipe) {
        var data = TouchInfo.firstSwipe;
        rootUI.checkTouch("swipe", data.x, data.y, data.vx, data.vy, data.sx, data.sy, data.id);
        TouchInfo.firstSwipe = null;
    }

    rootUI.update(timeStep, now);

    // uiX+=1;
    // topUI.setPosition(uiX,topUI.top);
    // topUI.moveBy(0.25,0);
}

function render(context, timeStep, now) {
    CUI.renderer.begin();

    rootUI.render(CUI.renderer, timeStep, now);

    CUI.renderer.end();
    // CUI.renderer.render();

}

function init() {

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    canvas = $id("canvas");
    canvas.width = Config.width;
    canvas.height = Config.height;

    game.width = Config.width;
    game.height = Config.height;
    var rect = canvas.getBoundingClientRect();
    game.offsetLeft = rect.left;
    game.offsetTop = rect.top;

    if (Config.pixi) {
        renderer = new CUI.PIXIRenderer({
            canvas: canvas,
            webgl: Config.webgl,
        });
    } else {
        renderer = new CUI.CanvasRenderer({
            canvas: canvas,
        });
    }

    CUI.renderer = renderer;

    initTouchController();
    initTapListener();
    initPanListener();
    initSwipeListener();

    controller.offsetLeft = game.offsetLeft;
    controller.offsetTop = game.offsetTop;

}

var Images = {};

var renderer;

var staticTimeStep;

function start() {
    beforeStart();
    staticTimeStep = 1000 / Config.FPS >> 0;
    // loopId = setInterval(gameLoop, staticTimeStep);
    gameLoop();
}

var stats = new Stats();

function gameLoop() {
    requestAnimationFrame(gameLoop);
    stats.begin();
    var now = Date.now();
    var timeStep = staticTimeStep;
    update(timeStep, now);
    render(context, timeStep, now);
    stats.end();
}


function $id(id) {
    return document.getElementById(id);
}
