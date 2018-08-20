var Config = {
    forceCanvas: false,
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

    initUI();
}

function update(timeStep, now) {

    updateControl(rootUI, timeStep, now);

    var panel = rootUI.children[0];
    if (panel) {
        // panel.scale = 1.0 + Math.sin(now / 600) * 0.1;
        // panel.rotation += timeStep / 1000;
        // panel.offsetX = Math.sin(now / 600) * 110;
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


    initControl();

    controller.offsetLeft = game.offsetLeft;
    controller.offsetTop = game.offsetTop;

}

var Images = {};

var renderer;

var staticTimeStep;

function start() {
    beforeStart();

    app = new PIXI.Application({
        forceCanvas: Config.forceCanvas,
        width: Config.width,
        height: Config.height,
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

    // // var container = new PIXI.Container();
    // var rect = new PIXI.Graphics();
    // rect.beginFill(0x222222, 0.5);
    // rect.lineStyle(40, 0x0000FF, 1, 0.5);
    // rect.drawRect(0, 0, Config.width, Config.height);
    // rect.endFill();
    // console.log(rect.width);
    // app.stage.addChild(rect);
    // container.addChild(rect);
    // rootUI.displayObject.addChild(rect);
    // // app.stage.addChild(container);



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
