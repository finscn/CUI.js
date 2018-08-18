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

    rootUI = new CUI.Root({
        parent: rootUI,
        width: game.width,
        height: game.height,

        // backgroundColor: CUI.Utils.colorRgb(100, 0, 0),
        // backgroundAlpha: 0.2,
        borderWidth: 20,
        borderColor: CUI.Utils.colorRgb(255, 50, 50),
        borderAlpha: 0.6,

        padding: 10,
    });
    var comp = rootUI;


    var panel = new CUI.Panel({
        test: true,
        parent: rootUI,
        // backgroundColor: CUI.Utils.colorRgb(100, 0, 0),
        // backgroundAlpha: 0.3,
        borderWidth: 20,
        borderColor: CUI.Utils.colorRgb(0, 0, 255),
        borderAlpha: 0.6,


        // width: null,
        // height: null,
        width: 250,
        height: 250,
        left: 0,
        top: 0,
        // right: 0,
        // bottom: 10,
    });

    var comp = new CUI.Picture({
        // test: true,
        parent: panel,
        // centerH: true,
        // centerV: true,
        left: 20,
        top: 20,
        right: 20,
        // bottom: 20,
        // width: null,
        // height: null,
        // width: 200,
        height: '100%-40',

        // src: "res/btn-bg.png",
        img: CUI.ImagePool["bg"],
        // borderWidth: 2,
        // scaleX: 2,
        // scaleY: 2,
        // scaleImg: false,

        // backgroundColor: CUI.Utils.colorRgb(100,240,23),
        // margin: 10,
        // layout: new CUI.HBoxLayout(),
    });

    // var comp = new CUI.Button({
    //     backgroundColor: CUI.Utils.colorRgb(255, 240, 230),
    //     left: 200,
    //     borderWidth: 2,
    //     // borderColor: CUI.Utils.colorHex("#ff0000"),
    //     parent: rootUI,
    //     width: 100,
    //     height: 90,
    //     borderImageInfo: {
    //         img: CUI.ImagePool["bg"],
    //         T: 20,
    //         R: 20,
    //         B: 20,
    //         L: 20,
    //     },
    //     // backgroundImg: i === 0 ? CUI.ImagePool["btn-bg"] : null,
    //     margin: 10,
    //     disabled: 0,
    //     textInfo: {
    //         text: "Big-Button-0",
    //         shadowColor: "#0000ff",
    //         shadowBlur: 2,
    //         shadowOffsetX: 4,
    //         shadowOffsetY: 4,
    //     },
    // });

    // rootUI.computeLayout();

    setTimeout(function() {
        // console.log(comp.parent.absoluteX, comp.parent.absoluteY);
        console.log(comp.absoluteX, comp.absoluteY, comp.absoluteWidth, comp.absoluteHeight);
        console.log(comp.displayObject);
    }, 100)
}

function update(timeStep, now) {

    updateControl(rootUI, timeStep, now);

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
