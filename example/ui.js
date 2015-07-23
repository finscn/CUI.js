var rootUI, topUI;
var uiT;
var uiX = 0;

function initUI() {
    rootUI = Component.createRoot(game.width, game.height);
    topUI = new ScrollArea({
        id: "topUI",
        left: 0,
        top: 0,
        backgroundColor: "rgba(255,240,230,1)",
        width: "100%",
        // height: "100%",
        height: 300,
        scrollHeight:400,
        parent: rootUI,
        layout: new CUI.HBoxLayout(),
        padding: 20,
    });
    topUI.init();

    for (var i = 0; i < 3; i++) {
        var ui1 = new Component({
            id: "ui-1-"+i,
            left: 0,
            top: 0,
            backgroundColor: "rgba(255,240,230,1)",
            width: 100,
            // height: "33%",
            height: 120,
            margin: 10,
            parent: topUI,
            // layout: new CUI.HBoxLayout(),
        });
        ui1.init();

        var ui2 = new Button({
            left: 0,
            bottom: 0,
            backgroundColor: "rgba(255,240,230,1)",
            width: 60,
            // height: "33%",
            height: 50,
            margin: 10,
            parent: ui1,

            textInfo: {
                offsetX: -5,
                text: "Button",
                color: "black"
            },
            onTouchStart: function(x, y, id) {
                this.scale = 0.9;
            },
            onTouchEnd: function(x, y, id) {
                this.scale = 1;
            },
            onTap: function(x, y, id) {

            },
        });
        ui2.init();
    }


        var ui3 = new Label({
            id: "ui-3",
            left: 0,
            top: 0,
            backgroundColor: "rgba(255,240,230,1)",
            // width: 100,
            // height: "33%",
            // height: 120,
            margin: 10,
            parent: topUI,
            textInfo: {
                // offsetX: -5,
                text: "test text 123",
                color: "black"
            },
            // layout: new CUI.HBoxLayout(),
        });
        ui3.init();

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////


    uiT = new Component({
        id: "ui-t",

        relative: "parent",
        centerH: true,
        left: 0,
        top: 160,
        backgroundColor: "rgba(255,200,100,1)",
        width: "50%",
        anchorX: "50%",
        anchorY: "50%",
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
        parent: uiT,
        col: 1,
        row: 0,
        colspan: 3,
        rowspan: 1,
        bgInfo: {
            img: Images["btn-bg"],
        },
        iconInfo: {
            img: Images["btn-icon"],
            offsetX: -24,
            width: 24,
            height: 24,
        },
        textInfo: {
            offsetX: 10,
            text: "Hello",
            color: "black"
        },
        onTouchStart: function(x, y, id) {
            this.scale = 0.9;
        },
        onTouchEnd: function(x, y, id) {
            this.scale = 1;
        },
        onTap: function(x, y, id) {

        }
    });
    uiC.init();


    var uiC = new Component({
        id: "bad",
        backgroundColor: "rgba(255,100,50,1)",
        normalBG: "rgba(255,100,50,1)",
        parent: uiT,
        col: 1,
        row: 1,
        colspan: 3,
        rowspan: 2,
        visible: true,
        // composite: false,
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
