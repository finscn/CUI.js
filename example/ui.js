var rootUI;
var uiT;
var uiX = 0;

var tempUI;
// scene.enter
function initUI() {

    rootUI = new CUI.Root({
        width: game.width,
        height: game.height,
    });

    var page = new CUI.Page({
        parent: rootUI,
        width: "100%",
        height: "100%",
        backgroundColor: CUI.Utils.colorRgb(155, 155, 155),
        borderWidth: 8,
        // borderColor: CUI.Utils.colorRgb(255, 50, 50),
        // borderAlpha: 0.6,
        padding: 10,
    });

    var scorllView = new CUI.ScrollView({
        id:'test-1',

        scrollH: true,
        scrollV: !true,

        parent: page,
        backgroundColor: CUI.Utils.colorRgb(255, 240, 230),
        left: 0,
        top: 0,
        padding: 20,
        width: "100%",
        height: "100%",
        // height: 300,
        // scrollHeight: 400,
        layout: "hbox",

        borderWidth: 2,
        borderColor: CUI.Utils.colorRgb(90, 200, 60),

    });



    var comp = new CUI.Picture({
        // centerH: true,
        // centerV: true,
        // left: 20,
        // top: 20,

        parent: scorllView,
        // src: "res/btn-bg.png",
        img: CUI.ImagePool["bg"],
        borderWidth: 2,
        // scaleX: 2,
        // scaleY: 2,
        scaleImg: false,
        width: 120,
        height: 120,

        // backgroundColor: CUI.Utils.colorRgb(100,240,23),
        // margin: 10,
        // layout: new CUI.HBoxLayout(),
    });

    var panel = new CUI.Panel({
        // centerH: true,
        // centerV: true,
        // left: 20,
        top: 150,

        parent: scorllView,
        relative: "parent",
        // src: "res/btn-bg.png",
        backgroundColor: CUI.Utils.colorHex("#ffffff"),
        bgInfo: {
            img: CUI.ImagePool["bg"]
        },
        // borderWidth: 2,
        paddingLeft: 10,
        paddingTop: 0,

        width: 200,
        height: 120,

        // backgroundColor: CUI.Utils.colorRgb(100,240,23),
        // margin: 10,
        // layout: new CUI.HBoxLayout(),
    });

    var panel = new CUI.Panel({
        // centerH: true,
        // centerV: true,
        left: 250,
        top: 150,

        parent: scorllView,
        relative: "parent",
        // src: "res/btn-bg.png",
        backgroundColor: CUI.Utils.colorHex("#ffffff"),
        borderImageInfo: {
            img: CUI.ImagePool["bg"],
            T: 20,
            R: 20,
            B: 20,
            L: 20,
        },
        // borderWidth: 2,
        paddingLeft: 10,
        paddingTop: 0,

        width: 200,
        height: 120,

        // backgroundColor: CUI.Utils.colorRgb(100,240,23),
        // margin: 10,
        // layout: new CUI.HBoxLayout(),
    });

    var label = new CUI.Label({
        testCmp:1,
        id: "label-1",
        parent: panel,
        backgroundColor: CUI.Utils.colorRgb(255, 240, 230),
        borderWidth: 2,
        borderColor: CUI.Utils.colorHex("#ff0000"),
        // text: "Text Test",
        textInfo: {
            // useCache: true,
            // color: CUI.Utils.colorRgb(255, 0, 0),
            color: "#ff0000",
            alpha: 1,
            // useCache: false,
            text: "Text Test - 1",
        },
        beforeUpdate: function() {
            this.setText("test-" + (Math.random() * 1000 >> 0), false);
        }
    });

    for (var i = 0; i < 2; i++) {
        var comp = new CUI.Button({
            id: 'btn-test-' + i,
            backgroundColor: CUI.Utils.colorRgb(255, 240, 230),
            borderWidth: 2,
            borderColor: CUI.Utils.colorHex("#ff0000"),
            parent: scorllView,
            width: i === 0 ? "auto" : 100,
            height: i === 0 ? "auto" : 60,
            padding: 8,
            backgroundImg: i === 0 ? CUI.ImagePool["btn-bg"] : null,
            margin: 10,
            disabled: i % 2,
            textInfo: {
                text: "Button-" + i,
            },
        });
    }

    var comp = new CUI.Button({
        backgroundColor: CUI.Utils.colorRgb(255, 240, 230),
        borderWidth: 2,
        // borderColor: CUI.Utils.colorHex("#ff0000"),
        parent: scorllView,
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
        disabled: i % 2,
        textInfo: {
            text: "Big-Button-0",
            shadowColor: "#0000ff",
            shadowBlur: 2,
            shadowOffsetX: 4,
            shadowOffsetY: 4,
        },
    });

}
