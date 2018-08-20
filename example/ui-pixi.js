var rootUI;

function initUI() {

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

    var comp = new CUI.Picture({
        parent: rootUI,

        img: CUI.ImagePool["bg"],

        // backgroundColor: CUI.Utils.colorRgb(100, 0, 0),
        // backgroundAlpha: 0.3,
        borderWidth: 10,
        borderColor: CUI.Utils.colorRgb(0, 0, 255),
        borderAlpha: 0.6,

        // TODO: 多种方式缩放
        // scaleImg:true,

        width: null,
        height: null,
        // width: 'auto',
        // height: 'auto',
        left: 10,
        right: 100,
        top: 10,
        bottom: 100,

        // right: 0,
        // bottom: 10,
    });
    console.log(comp)
return;
    var panel = new CUI.Panel({
        test: true,
        parent: rootUI,
        // backgroundImg: CUI.ImagePool["bg"],
        backgroundColor: CUI.Utils.colorRgb(200, 0, 0),
        backgroundAlpha: 0.5,
        borderWidth: 10,
        borderColor: CUI.Utils.colorRgb(0, 0, 255),
        borderAlpha: 0.6,

        // width: null,
        // height: null,
        width: 550,
        height: 350,
        left: 110,
        top: 110,

        // layout: "vbox",
        layout: {
            name: "table",
            // cellWidth: 100,
            // cellHeight: 100,

            // cellSpaceH: 10,
            // cellSpaceV: 10,

            cols: 2,
            rows: 2,
        },
        // right: 0,
        // bottom: 10,
    });
return;

    var row = 0;
    var col = 0;
    for (var i = 0; i < 4; i++) {
        var comp = new CUI.Button({
            parent: panel,
            centerH: true,
            centerV: true,
            // backgroundColor: CUI.Utils.colorRgb(100, 0, 0),
            // backgroundAlpha: 0.3,
            borderWidth: 6,
            borderColor: CUI.Utils.colorRgb(0, 0, 0),
            borderAlpha: 0.6,
            margin: 20,

            // width: null,
            // height: null,
            width: 50,
            height: 50,
            // left: 0,
            // top: 0,

            // layout: "hbox",
            // right: 0,
            // bottom: 10,
            col: col,
            row: row,
        });

        col++;
        if (col >= 2) {
            row++;
            col = 0;
        }
    }

    // var comp = new CUI.Picture({
    //     // test: true,
    //     parent: panel,
    //     // centerH: true,
    //     // centerV: true,
    //     left: 20,
    //     top: 20,
    //     width:'auto',
    //     height:'auto',

    //     borderWidth: 4,
    //     borderColor: CUI.Utils.colorRgb(255, 0, 0),
    //     borderAlpha: 0.6,

    //     // right: 20,
    //     // bottom: 20,
    //     // bottom: '50% + 10',
    //     // width: null,
    //     // height: null,
    //     // width: 200,
    //     // height: '100%-40',

    //     // src: "res/btn-bg.png",
    //     img: CUI.ImagePool["bg"],
    //     // borderWidth: 2,
    //     // scaleX: 2,
    //     // scaleY: 2,
    //     // scaleImg: false,

    //     // backgroundColor: CUI.Utils.colorRgb(100,240,23),
    //     // margin: 10,
    //     // layout: new CUI.HBoxLayout(),
    // });

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
