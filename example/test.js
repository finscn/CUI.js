var Config = {
    width: 600,
    height: 400,
    FPS: 30,
};

var game = {};
var canvas, context;
var loopId;
window.onload = function() {

    init();
    start();
};

var Component = CUI.Component;

function beforeStart(timeStep, now) {
    Component.initRoot(game);

    var topUI = new Component({
        left: 0,
        top: 0,
        backgroundColor: "rgba(255,240,230,1)",
        width: "100%",
        height: "100%",
        parent: Component.root,
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
        relative: "parent",
        left: 0,
        top: 150,
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
    });
    uiT.init();

    var uiC = new Component({
        backgroundColor: "rgba(255,100,50,1)",
        normalBG: "rgba(255,100,50,1)",
        margin: 10,
        parent: uiT,
        col: 0,
        row: 0,
        colspan: 1,
        rowspan: 3,
        composite: false,
        onTouchStartAction: function(x, y, id) {
            this.backgroundColor = "red";
        },
        onTouchEndAction: function(x, y, id) {
            this.backgroundColor = this.normalBG;
        },
        onTapAction: function(x, y, id) {
            this.backgroundColor = this.normalBG;
            setTimeout(function() {
                alert("别点我 a, " + id);
            }, 10);
        }
    });
    uiC.init();

    var uiC = new Component({
        backgroundColor: "rgba(255,100,50,1)",
        normalBG: "rgba(255,100,50,1)",
        parent: uiT,
        col: 1,
        row: 0,
        colspan: 3,
        rowspan: 1,
        composite: false,
        onTouchStartAction: function(x, y, id) {
            this.backgroundColor = "red";
        },
        onTouchEndAction: function(x, y, id) {
            this.backgroundColor = this.normalBG;
        },
        onTapAction: function(x, y, id) {
            this.backgroundColor = this.normalBG;
            setTimeout(function() {
                alert("别点我 b, " + id);
            }, 10);
        }
    });
    uiC.init();
    var uiC = new Component({
        backgroundColor: "rgba(255,100,50,1)",
        normalBG: "rgba(255,100,50,1)",
        parent: uiT,
        col: 1,
        row: 1,
        colspan: 3,
        rowspan: 2,
        onTouchStartAction: function(x, y, id) {
            this.backgroundColor = "red";
        },
        onTouchEndAction: function(x, y, id) {
            this.backgroundColor = this.normalBG;
        },
        onTapAction: function(x, y, id) {
            this.backgroundColor = this.normalBG;
            setTimeout(function() {
                alert("别点我 c, " + id);
            }, 10);
        }
    });
    uiC.init();
}

function update(timeStep, now) {
    if (TouchInfo.firstTap) {
        var data = TouchInfo.firstTap;
        CUI.Component.root.onTap(data.x, data.y, data.id);
        TouchInfo.firstTap = null;
    } else if (TouchInfo.firstStart) {
        var data = TouchInfo.firstStart;
        CUI.Component.root.onTouchStart(data.x, data.y, data.id);
        TouchInfo.firstStart = null;
    } else if (TouchInfo.firstEnd) {
        var data = TouchInfo.firstEnd;
        CUI.Component.root.onTouchEnd(data.x, data.y, data.id);
        TouchInfo.firstEnd = null;
    }
    CUI.Component.root.update();
}

function render(context, timeStep, now) {
    context.fillStyle = "rgba(0,0,0,1)";
    context.fillRect(0, 0, Config.width, Config.height);

    CUI.Component.root.render(context);

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
