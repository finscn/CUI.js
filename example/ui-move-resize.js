var rootUI;
var scrollView;
var borderWidth = 4;
// scene.enter
var buttons = [];

function initUI() {

    rootUI = new CUI.Root({
        renderer: renderer,

        width: game.width,
        height: game.height,

        backgroundColor: renderer.colorRgb(155, 155, 155),
        borderWidth: 8,
        borderColor: renderer.colorRgb(22, 22, 22),
        // borderAlpha: 0.6,
        padding: 10,

        beforeUpdate: function(timeStep, now) {
            var x = Math.sin(now / 600) * 10;
            var y = Math.cos(now / 600) * 10;
            this.moveTo(10 + x, 10 + y);
            this.resizeTo(400 + x * 4, 500 + y * 4);
        }
    });

    panel0 = rootUI;

    // var panel0 = new CUI.Panel({
    //     parent: rootUI,
    //     width: 400,
    //     height: 400,
    //     // width: '100%',
    //     // height: '100%',
    //     backgroundColor: renderer.colorRgb(220, 220, 220),
    //     borderWidth: borderWidth,
    //     borderColor: renderer.colorRgb(90, 255, 60),
    //     // layout: {
    //     //     name: 'hbox',
    //     //     align: 'right'
    //     // },
    //     padding: 10,
    //     beforeUpdate: function(timeStep, now) {
    //         var x = Math.sin(now / 600) * 10;
    //         var y = Math.cos(now / 600) * 10;
    //         this.moveTo(10 + x, 10 + y);
    //         this.resizeTo(400 + x * 4, 400 + y * 4);
    //         this.flush();
    //     }
    // });

    var comp = new CUI.Button({
        parent: panel0,
        backgroundImage: CUI.ImagePool["btn-bg"],
        borderWidth: borderWidth,
        padding: 2,
        margin: 10,
        width: 90,
        height: 40,
        textInfo: {
            text: "Button-0",
        },
    });

    var comp = new CUI.Button({
        parent: panel0,
        backgroundImage: CUI.ImagePool["btn-bg"],
        borderWidth: borderWidth,
        right: 0,
        bottom: 0,
        padding: 2,
        margin: 10,
        width: 90,
        height: 40,
        textInfo: {
            text: "Button-3",
        },
    });

    var comp = new CUI.Picture({
        // visible: false,
        parent: panel0,
        left: 100,
        // ignoreLayout: true,
        // alignH: "center",
        // parent: scrollView,
        // src: "res/btn-bg.png",
        width: "50%",
        height: "50%",
        scaleImg: false,
        imgInfo: {
            alignH: "center",
            img: CUI.ImagePool["logo"],
            scaleX: 2,
            scaleY: 1,
            flipX: true,
            flipY: true,
        },
        borderWidth: borderWidth,
        borderColor: renderer.colorRgb(255, 22, 33),
        backgroundColor: renderer.colorRgb(100, 240, 23),


        margin: 10,
    });

    var panel1 = new CUI.Panel({
        parent: panel0,
        width: "50% + 10",
        height: "40%",
        alignH: "center",
        alignV: "center",
        // width: '100%',
        // height: '100%',
        top: 90,
        backgroundColor: renderer.colorRgb(220, 220, 220),
        backgroundImage: CUI.ImagePool["bg"],

        borderWidth: borderWidth,
        borderColor: renderer.colorRgb(90, 20, 255),
        // layout: {
        //     name: 'hbox',
        //     align: 'right'
        // },
        padding: 10,
        // beforeUpdate: function(timeStep, now) {
        //     var x = Math.sin(now / 600) * 10;
        //     var y = Math.cos(now / 600) * 10;
        //     this.moveTo(10 + x, 10 + y);
        //     this.resizeTo(400 + x * 4, 400 + y * 4);
        //     this.flush();
        // }
    });

    var comp = new CUI.Button({
        parent: panel1,
        backgroundImage: CUI.ImagePool["btn-bg"],
        borderWidth: borderWidth,
        padding: 2,
        margin: 10,
        width: 90,
        height: 40,
        textInfo: {
            text: "Button-0",
        },
    });

    var comp = new CUI.Button({
        parent: panel1,
        backgroundImage: CUI.ImagePool["btn-bg"],
        borderWidth: borderWidth,
        right: 0,
        bottom: 0,
        padding: 2,
        margin: 10,
        width: 90,
        height: 40,
        textInfo: {
            text: "Button-3",
        },
    });


    var panel2 = new CUI.ScrollView({
        parent: rootUI,
        bottom: 10,
        width: 250,
        height: 200,
        // width: '100%',
        // height: '100%',
        backgroundColor: renderer.colorRgb(220, 220, 220),
        borderWidth: borderWidth,
        borderColor: renderer.colorRgb(90, 255, 60),
        layout: {
            name: 'table',
            cols: 4,
            rows: 4,
            cellWidth: 120,
            cellHeight: 120,
            cellSpace: 0,
        },
        padding: 10
    });

    var idx = 0;
    for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 2; c++) {
            var comp = new CUI.Button({
                parent: panel2,
                backgroundColor: renderer.colorRgb(255, 240, 230),
                backgroundImage: idx % 3 === 0 ? CUI.ImagePool["btn-bg"] : null,
                borderWidth: borderWidth,
                borderColor: renderer.colorHex("#ff0000"),
                width: idx % 3 === 0 ? "auto" : 100,
                height: idx % 3 === 0 ? "auto" : 60,
                padding: 2,
                margin: 10,
                disabled: idx % 2,
                textInfo: {
                    text: "Button-" + idx,
                },
                col: c,
                row: r,
            });
            idx++;
        }
    }

}
