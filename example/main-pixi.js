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
var app;
var rootUI;

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

    rootUI = new CUI.Root({
        parent: rootUI,
        width: game.width,
        height: game.height,
        backgroundColor: CUI.Utils.colorRgb(155, 155, 155),
        borderWidth: 8,
        // borderColor: CUI.Utils.colorRgb(255, 50, 50),
        // borderAlpha: 0.6,
        padding: 10,
    });
    // var comp = new CUI.Picture({
    //     // centerH: true,
    //     // centerV: true,
    //     left: 0,
    //     // top: 20,

    //     parent: rootUI,
    //     // src: "res/btn-bg.png",
    //     img: CUI.ImagePool["bg"],
    //     borderWidth: 2,
    //     // scaleX: 2,
    //     // scaleY: 2,
    //     scaleImg: false,
    //     width: 100,
    //     height: 100,

    //     // backgroundColor: CUI.Utils.colorRgb(100,240,23),
    //     // margin: 10,
    //     // layout: new CUI.HBoxLayout(),
    // });

    var comp = new CUI.Button({
        backgroundColor: CUI.Utils.colorRgb(255, 240, 230),
        left: 200,
        borderWidth: 2,
        // borderColor: CUI.Utils.colorHex("#ff0000"),
        parent: rootUI,
        width: 100,
        height: 90,
        borderImageInfo: {
            img: CUI.ImagePool["bg"],
            T: 20,
            R: 20,
            B: 20,
            L: 20,
        },
        // backgroundImg: i === 0 ? CUI.ImagePool["btn-bg"] : null,
        margin: 10,
        disabled: 0,
        textInfo: {
            text: "Big-Button-0",
            shadowColor: "#0000ff",
            shadowBlur: 2,
            shadowOffsetX: 4,
            shadowOffsetY: 4,
        },
    });
    // rootUI.computeLayout();
    setTimeout(function() {
        // console.log(comp.parent.absoluteX, comp.parent.absoluteY);
        console.log(comp.absoluteX, comp.absoluteY, comp.absoluteWidth, comp.absoluteHeight);
        console.log(comp.displayObject);
    }, 100)
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


function init() {

    canvas = $id("canvas");
    canvas.width = Config.width;
    canvas.height = Config.height;

    game.width = Config.width;
    game.height = Config.height;
    var rect = canvas.getBoundingClientRect();
    game.offsetLeft = rect.left;
    game.offsetTop = rect.top;


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

    app = new PIXI.Application({
        view: canvas,
        backgroundColor: 0x1099bb
    });
    // document.body.appendChild(app.view);

    // create a new Sprite from an image path
    var bunny = PIXI.Sprite.fromImage('res/btn-bg.png')

    // center the sprite's anchor point
    bunny.anchor.set(0.5);

    // move the sprite to the center of the screen
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.stage.addChild(bunny);

    app.stage.addChild(rootUI.displayObject);

    // Listen for animate update
    app.ticker.add(function(delta) {
        var now = Date.now();
        update(delta, now);
        bunny.rotation += 0.1 * delta;
    });

}

function $id(id) {
    return document.getElementById(id);
}
