var rootUI;
var uiT;
var uiX = 0;

var tempUI;
// scene.enter

function initUI() {

    initTexture();

    rootUI = new CUI.Root({
        renderer: renderer,
        width: game.width,
        height: game.height,
        padding: 10,
    });

    // var rootUI = new CUI.Page({
    //     parent: rootUI,
    //     width: "100%",
    //     height: "100%",
    //     // backgroundColor: renderer.colorRgb(155, 155, 155),
    //     backgroundColor: renderer.colorRgb(0, 0, 0),
    //     borderWidth: 8,
    //     // borderColor: renderer.colorRgb(255, 50, 50),
    //     // borderAlpha: 0.6,
    //     padding: 10,
    // });


    var panel = new CUI.Panel({
        centerH: true,
        centerV: true,
        // left: 20,
        // top: 20,

        parent: rootUI,
        relative: "parent",
        // src: "res/btn-bg.png",
        // backgroundColor: renderer.colorHex("#ffffff"),

        borderImageInfo: panelBorderImageInfo,

        // borderWidth: 2,
        paddingLeft: 10,
        paddingTop: 0,

        width: 400,
        height: 320,

        // backgroundColor: renderer.colorRgb(100,240,23),
        // margin: 10,
        // layout: new CUI.HBoxLayout(),
    });


    var comp = new CUI.Button({
        // backgroundColor: renderer.colorRgb(255, 240, 230),
        borderWidth: 2,
        top: 50,
        left: 50,
        // borderColor: renderer.colorHex("#ff0000"),
        parent: panel,
        width: 160,
        height: 80,

        borderImageInfo: buttonBorderImageInfo,

        // backgroundImg: i === 0 ? CUI.ImagePool["btn-bg"] : null,
        margin: 10,
        disabled: false,
        textInfo: {
            // offsetY: 2,
            // alignV:'top',

            useCache: true,

            color: '#ffffff',
            text: "按钮",
            fontSize: 22,
            fontWeight: 'bolder',
            strokeColor: '#000000',
            strokeWidth: 3,

            shadowColor: "#000000",
            // shadowBlur: 2,
            shadowOffsetX: 0,
            shadowOffsetY: 3,
        },
    });

}
