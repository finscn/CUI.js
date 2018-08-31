var rootUI;

function initUI() {

    rootUI = new CUI.Root({
        width: game.width,
        height: game.height,
        renderer: renderer,
    });

    var json = {
        ui: CUI.Panel,
        width: "100%",
        height: "100%",
        backgroundColor: renderer.colorRgb(155, 155, 155),
        borderWidth: 8,
        // borderColor: renderer.colorRgb(255, 50, 50),
        // borderAlpha: 0.6,
        padding: 10,
        children: [{
            ui: CUI.ScrollView,

            scrollH: true,
            scrollV: !true,

            backgroundColor: renderer.colorRgb(255, 240, 230),
            left: 0,
            top: 0,
            padding: 20,
            width: "100%",
            height: "100%",
            // height: 300,
            // scrollHeight: 400,
            layout: "hbox",

            borderWidth: 2,
            borderColor: renderer.colorRgb(90, 200, 60),

            children: [

                {
                    // centerH: true,
                    // centerV: true,
                    // left: 20,
                    // top: 20,

                    ui: CUI.Picture,

                    // src: "res/btn-bg.png",
                    img: CUI.ImagePool["bg"],
                    borderWidth: 2,
                    // scaleX: 2,
                    // scaleY: 2,
                    scaleImg: false,
                    width: 120,
                    height: 120,

                    // backgroundColor: renderer.colorRgb(100,240,23),
                    // margin: 10,
                    // layout: new CUI.HBoxLayout(),
                },

                {
                    ui: CUI.Panel,

                    // centerH: true,
                    // centerV: true,
                    // left: 20,
                    top: 150,

                    ignoreLayout: true,
                    // src: "res/btn-bg.png",
                    backgroundColor: renderer.colorHex("#ffffff"),
                    bgInfo: {
                        img: CUI.ImagePool["bg"]
                    },
                    // borderWidth: 2,
                    paddingLeft: 10,
                    paddingTop: 0,

                    width: 200,
                    height: 120,

                    // backgroundColor: renderer.colorRgb(100,240,23),
                    // margin: 10,
                    // layout: new CUI.HBoxLayout(),
                },

                {
                    ui: CUI.Panel,

                    // centerH: true,
                    // centerV: true,
                    left: 250,
                    top: 150,

                    ignoreLayout: true,
                    // src: "res/btn-bg.png",
                    backgroundColor: renderer.colorHex("#ffffff"),
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

                    // backgroundColor: renderer.colorRgb(100,240,23),
                    // margin: 10,
                    // layout: new CUI.HBoxLayout(),

                    children: [{
                        ui: CUI.Label,
                        // id: "label-1",
                        backgroundColor: renderer.colorRgb(255, 240, 230),
                        borderWidth: 2,
                        borderColor: renderer.colorHex("#ff0000"),
                        // text: "Text Test",
                        textInfo: {
                            // useCache: true,
                            // color: renderer.colorRgb(255, 0, 0),
                            color: "#ff0000",
                            alpha: 1,
                            // useCache: false,
                            text: "Text Test - 112233",
                        }
                    }, ]
                },

                {
                    ui: CUI.Button,

                    backgroundColor: renderer.colorRgb(255, 240, 230),
                    borderWidth: 2,
                    borderColor: renderer.colorHex("#ff0000"),
                    width: "auto",
                    height: "auto",
                    backgroundImg: CUI.ImagePool["btn-bg"],
                    margin: 10,
                    disabled: false,
                    textInfo: {
                        text: "Button-" + 0,
                    },
                },

                {
                    ui: CUI.Button,

                    backgroundColor: renderer.colorRgb(255, 240, 230),
                    borderWidth: 2,
                    borderColor: renderer.colorHex("#ff0000"),
                    width: 100,
                    height: 60,
                    backgroundImg: null,
                    margin: 10,
                    disabled: true,
                    textInfo: {
                        text: "Button-" + 1,
                    },
                },

                {
                    ui: CUI.Button,

                    backgroundColor: renderer.colorRgb(255, 240, 230),
                    borderWidth: 2,
                    // borderColor: renderer.colorHex("#ff0000"),
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
                    disabled: false,
                    textInfo: {
                        text: "Big-Button-0",
                        shadowColor: "#0000ff",
                        shadowBlur: 2,
                        shadowOffsetX: 4,
                        shadowOffsetY: 4,
                    },
                }

            ],
        }]
    }

    CUI.Component.create(json, rootUI);
}
