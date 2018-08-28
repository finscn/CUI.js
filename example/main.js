var Config = {
    width: 720,
    height: 720,
    FPS: 60,
};

var game = {};
var canvas, context;
var loopId;

var rootUI;
var renderer;


window.onload = function() {
    init();
    CUI.Utils.loadImages(
        [
            { id: "bg", src: "./res/bg.png" },
            { id: "btn-bg", src: "./res/btn-bg.png" },
            { id: "btn-icon", src: "./res/btn-icon.png" },
            { id: "logo", src: "./res/HTML5_Logo_128.png" },
        ],
        function(imgPool) {
            for (var id in imgPool) {
                CUI.ImagePool[id] = imgPool[id];
            }
            start();
        }
    );

};

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


var frame = 0;

function run(timeStep, now) {
    frame++;
    timeStep = 16;

    updateControl(rootUI, timeStep, now);

    var panel = rootUI.children[0];
    if (panel) {
        // panel.scale = 1.0 + Math.sin(now / 600) * 0.1;
        // panel.rotation += timeStep / 1000;
        // panel.offsetX = Math.sin(now / 600) * 110;
    }
    rootUI.update(timeStep, now);

    render();
    // uiX+=1;
    // topUI.setPosition(uiX,topUI.top);
    // topUI.moveBy(0.25,0);
}




function start() {

    initRenderer();

    initUI();

    initStage();

    var timeStep = 1000 / Config.FPS >> 0;

    setInterval(function() {
        run(timeStep, Date.now());
    }, timeStep);

}

function $id(id) {
    return document.getElementById(id);
}
