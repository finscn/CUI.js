var Config = {
    width: 560,
    height: 400,
    FPS: 30,
};

var game = {};
var canvas, context;
var loopId;

var Component = CUI.Component;
var Button = CUI.Button;
var Utils = CUI.Utils;
var rootUI;

window.onload = function() {
    init();

    CUI.Utils.loadImage("./res/btn-blue.png", function(img) {
        Images["btn-blue"] = img;
        start();
    });
};



function beforeStart(timeStep, now) {
    rootUI = Component.createRoot(game.width, game.height);
    var topUI = new Component({
        id: "topUI",
        left: 0,
        top: 0,
        backgroundColor: "rgba(255,240,230,1)",
        width: "100%",
        height: "100%",
        parent: rootUI,
        layout: new CUI.HBoxLayout(),
        padding: 20,
    });
    topUI.init();

    for (var i = 0; i < 3; i++) {
        var ui1 = new Component({
            left: 0,
            top: 0,
            backgroundColor: "rgba(255,240,230,1)",
            width: 100,
            // height: "33%",
            height: 120,
            margin: 10,
            parent: topUI,
            layout: new CUI.HBoxLayout(),
        });
        ui1.init();

        for (var j = 0; j < 2; j++) {
            var ui2 = new Component({
                left: 0,
                bottom: 0,
                backgroundColor: "rgba(255,240,230,1)",
                width: "30%",
                height: 25,
                margin: 10,
                parent: ui1
            });
            ui2.init();

            for (var k = 0; k < 2; k++) {
                var ui3 = new Component({
                    centerX: true,
                    left: 0,
                    top: 0,
                    backgroundColor: "rgba(255,240,230,1)",
                    width: "50%",
                    height: "50%",
                    margin: 4,
                    parent: ui2,
                    layout: new CUI.VBoxLayout(),
                });
                ui3.init();
            }
        }
    }


    var uiT = new Component({
        id: "ttt",

        relative: "parent",
        centerH: true,
        left: 0,
        top: 160,
        backgroundColor: "rgba(255,200,100,1)",
        width: "50%",
        height: 150,
        margin: 10,
        parent: topUI,
        layout: new CUI.TableLayout({
            cols: 4,
            rows: 3,
            cellSpace: 10,
        }),
        onTouchStart: function(x, y, id) {
            this.scale = 0.8;
        },
        onTouchEnd: function(x, y, id) {
            this.scale = 1;
        },
    });
    uiT.init();

    var uiC = new Component({
        id: "a",
        backgroundColor: "rgba(255,100,50,1)",
        normalBG: "rgba(255,100,50,1)",
        margin: 10,
        parent: uiT,
        col: 0,
        row: 0,
        colspan: 1,
        rowspan: 3,
        composite: false,
        onTouchStart: function(x, y, id) {
            this.backgroundColor = "red";
        },
        onTouchEnd: function(x, y, id) {
            this.backgroundColor = this.normalBG;
        },
        onTap: function(x, y, id) {
            this.backgroundColor = this.normalBG;
            var Me = this;
            setTimeout(function() {
                alert("别点我 " + Me.id + " , " + id);
            }, 10);
        }
    });
    uiC.init();

    var uiC = new Button({
        id: "button2",
        backgroundColor: "rgba(255,100,50,1)",
        normalBG: "rgba(255,100,50,1)",
        parent: uiT,
        col: 1,
        row: 0,
        colspan: 3,
        rowspan: 1,
        bgInfo: {
            img: Images["btn-blue"]
        },
        textInfo: {
            text: "Hello",
            color: "black"
        },
        onTouchStart: function(x, y, id) {
            this.backgroundColor = "red";
            this.scale = 0.9;
        },
        onTouchEnd: function(x, y, id) {
            this.backgroundColor = this.normalBG;
            this.scale = 1;
        },
        onTap: function(x, y, id) {
            this.backgroundColor = this.normalBG;
        }
    });
    uiC.init();
    var uiC = new Component({
        id: "c",
        backgroundColor: "rgba(255,100,50,1)",
        normalBG: "rgba(255,100,50,1)",
        parent: uiT,
        col: 1,
        row: 1,
        colspan: 3,
        rowspan: 2,
        onTouchStart: function(x, y, id) {
            this.backgroundColor = "red";
        },
        onTouchEnd: function(x, y, id) {
            this.backgroundColor = this.normalBG;
        },
        onTap: function(x, y, id) {
            this.backgroundColor = this.normalBG;
            var Me = this;
            setTimeout(function() {
                alert("别点我 " + Me.id + " , " + id);
            }, 10);
        }
    });
    uiC.init();
}

function update(timeStep, now) {
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
    }
    rootUI.update();
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
