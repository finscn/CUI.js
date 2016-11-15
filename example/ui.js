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
        backgroundColor: "rgba(150,150,150,1)",
        padding: 10,
    });

    var scorllView = new CUI.ScrollView({

        scrollH: true,
        scrollV: !true,

        parent: page,
        backgroundColor: "rgba(255,240,230,1)",
        left: 0,
        top: 0,
        padding: 20,
        width: "100%",
        height: "100%",
        // height: 300,
        // scrollHeight: 400,
        layout: "hbox",
    });

    var bgImg = Images["btn-bg"];
    var img = Images["btn-icon"];

    var comp = new CUI.Picture({
        // centerH: true,
        // centerV: true,
        // left: 20,
        // top: 20,

        parent: scorllView,
        // src: "res/btn-bg.png",
        img: Images["btn-bg"],
        borderWidth: 2,
        // scaleX: 2,
        // scaleY: 2,
        scaleImg: false,
        width: 120,
        height: 120,

        // backgroundColor: "rgba(100,240,230,1)",
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
            img:  Images["btn-bg"]
        },
        borderWidth: 2,
        paddingLeft: 10,
        paddingTop: 0,

        width: 160,
        height: 120,

        // backgroundColor: "rgba(100,240,230,1)",
        // margin: 10,
        // layout: new CUI.HBoxLayout(),
    });

    var label = new CUI.Label({
        parent: panel,
        backgroundColor: "rgba(255,240,230,1)",
        borderWidth: 2,
        borderColor: "red",
        // text: "Text Test",
        textInfo: {
            useCache: true,
            text: "Text Test",
        }
    });

    for (var i = 0; i < 2; i++) {
        var comp = new CUI.Button({
            backgroundColor: "rgba(255,240,230,1)",
            borderWidth: 2,
            borderColor: "red",
            parent: scorllView,
            width: 100,
            height: 60,
            margin: 10,
            disabled: i%2,
            textInfo: {
                text: "Button-" + i,
            },
        });
    }

}
