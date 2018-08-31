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
        width: "50%",
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
        width: 300,
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


    return;

    var idx = 0;
    for (var i = 0; i < 4; i++) {
        var panelV = new CUI.Panel({
            margin: 20,
            parent: panelH,
            width: 'auto',
            height: 'auto',
            backgroundColor: renderer.colorRgb(220, 220, 220),
            borderWidth: borderWidth,
            borderColor: renderer.colorRgb(90, 0, 60),
            layout: 'vbox',
        });
        for (var j = 0; j < 4; j++) {
            var comp = new CUI.Button({
                id: 'btn-' + idx,
                // backgroundColor: renderer.colorRgb(255, 240, 230),
                // backgroundImage: CUI.ImagePool["btn-bg"],
                backgroundInfo: {
                    img: CUI.ImagePool["btn-bg"],
                    // scale: 2,
                },
                borderWidth: borderWidth,
                borderColor: renderer.colorHex("#ff0000"),
                parent: panelV,
                width: idx % 3 === 0 ? "auto" : 60,
                height: idx % 3 === 0 ? "auto" : 60,
                padding: 2,
                margin: 10,
                disabled: idx % 2,
                textInfo: {
                    text: "Button-" + idx,
                },
                // col: c,
                // row: r,
            });
            if (idx === 6) {
                comp.beforeUpdate = function() {
                    var t = Date.now() % 2000;
                    if (t < 1000) {
                        this.setText("test-" + 1);
                    } else {
                        this.setText("test-" + 122222222);
                    }
                    // if (Date.now() % 20 === 0) {
                    //     this.setText("test-" + (Math.random() * 100000 >> 0));
                    // } else if (Date.now() % 11 === 0) {
                    // }
                    // this.updateText((frame % 4 === 0) ? Date.now() : 123);
                }
            }
            buttons.push(comp);
            idx++;
        }
    }



    var comp = new CUI.SliderBar({
        parent: rootUI,
        left: 20,
        top: 320,
        width: 600,
        height: 60,
        backgroundColor: renderer.colorRgb(250, 250, 250),
        trackInfo: {
            backgroundColor: renderer.colorRgb(250, 0, 0),
        },
        handleInfo: {
            backgroundColor: renderer.colorRgb(0, 0, 0),
        },
        onChanged: function(value) {
            console.log("SliderBar : ", value.toFixed(3))
        },
    });

    return;

    var label = new CUI.Label({
        testCmp: 1,
        id: "label-1",
        parent: rootUI,
        right: 0,
        zIndex: 999,
        backgroundColor: renderer.colorRgb(255, 240, 230),
        borderWidth: borderWidth,
        borderColor: renderer.colorHex("#ff0000"),
        // text: "Text Test",
        width: 'auto',
        height: 'auto',
        textInfo: {
            // color: renderer.colorRgb(255, 0, 0),
            color: "#ff0000",
            alpha: 1,
            text: "Text Test - 1",
        },
        beforeUpdate: function() {
            if (Date.now() % 3 === 0) {
                this.setText("test-" + (Math.random() * 1000 >> 0), false);
            }
        }
    });


    scrollView = new CUI.ScrollView({
        // scrollView = new CUI.Panel({
        id: 'test-1',

        scrollH: !true,
        scrollV: true,

        parent: rootUI,

        backgroundColor: renderer.colorRgb(255, 240, 230),
        borderWidth: borderWidth,
        borderColor: renderer.colorRgb(90, 200, 60),

        left: 0,
        top: 0,
        padding: 20,
        width: "100% - 20",
        // width: 300,
        height: "100% - 40",
        // height: 300,
        // scrollHeight: 400,

        // layout: "hbox",
        layout: "vbox",
        // layout: new CUI.TableLayout({
        //     cols: 4,
        //     rows: 4,
        //     cellWidth: 200,
        //     cellHeight: 150,
        //     cellSpace: 0,
        // }),
    });



    var idx = 0;




    var comp = new CUI.Button({
        test: true,
        backgroundColor: renderer.colorRgb(255, 240, 230),
        backgroundImage: idx % 3 === 0 ? CUI.ImagePool["btn-bg"] : null,
        borderWidth: borderWidth,
        borderColor: renderer.colorHex("#ff0000"),
        parent: rootUI,
        width: idx % 3 === 0 ? "auto" : 100,
        height: idx % 3 === 0 ? "auto" : 60,
        padding: 2,
        margin: 10,

        // anchor:0,
        scale: 2,
        flipX: true,
        rotation: 0.3,

        disabled: idx % 2,
        textInfo: {
            text: "Button-" + idx,
        },
        left: 0,
        col: c,
        row: r,
    });
    window.testCmp = comp;
    // return;



    // var comp = new CUI.Button({

    //     backgroundColor: renderer.colorRgb(255, 240, 230),
    //     borderWidth: borderWidth,
    //     // borderColor: renderer.colorHex("#ff0000"),
    //     // parent: scrollView,
    //     width: 100,
    //     height: 90,
    //     borderImageInfo: {
    //         img: CUI.ImagePool["bg"],
    //         T: 20,
    //         R: 20,
    //         B: 20,
    //         L: 20,
    //     },
    //     // backgroundImage: i === 0 ? CUI.ImagePool["btn-bg"] : null,
    //     margin: 10,
    //     disabled: false,
    //     textInfo: {
    //         text: "Big-Button-0",
    //         shadowColor: "#0000ff",
    //         shadowBlur: 2,
    //         shadowOffsetX: 4,
    //         shadowOffsetY: 4,
    //     },
    // });



    // var panel = new CUI.Panel({
    //     // centerH: true,
    //     // centerV: true,
    //     // left: 20,
    //     top: 150,

    //     parent: scrollView,
    //     ignoreLayout: true,
    //     // src: "res/btn-bg.png",
    //     backgroundColor: renderer.colorHex("#ffffff"),
    //     bgInfo: {
    //         img: CUI.ImagePool["bg"]
    //     },
    //     // borderWidth: borderWidth,
    //     paddingLeft: 0,
    //     paddingTop: 0,

    //     width: 200,
    //     height: 120,

    //     // backgroundColor: renderer.colorRgb(100,240,23),
    //     // margin: 10,
    //     // layout: new CUI.HBoxLayout(),
    // });

    // var panel = new CUI.Panel({
    //     id: 'panel-1111',
    //     // centerH: true,
    //     // centerV: true,
    //     left: 250,
    //     top: 150,

    //     parent: scrollView,
    //     ignoreLayout: true,
    //     // src: "res/btn-bg.png",
    //     backgroundColor: renderer.colorHex("#ffffff"),
    //     borderImageInfo: {
    //         img: CUI.ImagePool["bg"],
    //         T: 20,
    //         R: 20,
    //         B: 20,
    //         L: 20,
    //     },
    //     // borderWidth: borderWidth,
    //     paddingLeft: 10,
    //     paddingTop: 0,

    //     width: 200,
    //     height: 120,

    //     // backgroundColor: renderer.colorRgb(100,240,23),
    //     // margin: 10,
    //     // layout: new CUI.HBoxLayout(),
    // });


}
