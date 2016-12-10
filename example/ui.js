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
        backgroundColor: "rgba(155, 155, 155, 1)",
        borderWidth: 8,
        borderColor: "rgba(255, 50, 50, 0.6)",
        padding: 10,
    });

    var scorllView = new CUI.ScrollView({

        scrollH: true,
        scrollV: !true,

        parent: page,
        backgroundColor: "rgba(255, 240, 230, 1)",
        left: 0,
        top: 0,
        padding: 20,
        width: "100%",
        height: "100%",
        // height: 300,
        // scrollHeight: 400,
        layout: "hbox",

        borderWidth: 2,
        borderColor: "rgba(90, 200, 60, 1)",

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

        // backgroundColor: "rgba(100, 240, 23, 1)",
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
        backgroundColor: "#ffffff",
        bgInfo: {
            img: CUI.ImagePool["bg"]
        },
        // borderWidth: 2,
        paddingLeft: 10,
        paddingTop: 0,

        width: 200,
        height: 120,

        // backgroundColor: "rgba(100, 240, 23, 1)",
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
        backgroundColor: "#ffffff",
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

        // backgroundColor: "rgba(100, 240, 23, 1)",
        // margin: 10,
        // layout: new CUI.HBoxLayout(),
    });

    var label = new CUI.Label({
        id: "label-1",
        parent: panel,
        backgroundColor: "rgba(255, 240, 230, 1)",
        borderWidth: 2,
        borderColor: "#ff0000",
        // text: "Text Test",
        textInfo: {
            color: "#ff0000",
            alpha: 1,
            useCache: false,
            text: "Text Test - 1",
        }
    });

    for (var i = 0; i < 2; i++) {
        var comp = new CUI.Button({
            backgroundColor: "rgba(255, 240, 230, 1)",
            borderWidth: 2,
            borderColor: "#ff0000",
            parent: scorllView,
            width: i === 0 ? "auto" : 100,
            height: i === 0 ? "auto" : 60,
            backgroundImg: i === 0 ? CUI.ImagePool["btn-bg"] : null,
            margin: 10,
            disabled: i % 2,
            textInfo: {
                text: "Button-" + i,
            },
        });
    }

    var comp = new CUI.Button({
        backgroundColor: "rgba(255, 240, 230, 1)",
        borderWidth: 2,
        // borderColor: CUI.renderer.colorHex("#ff0000"),
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
        },
    });

}
