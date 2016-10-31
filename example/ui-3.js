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
        // padding: 10,
        layout: new CUI.TableLayout({
            name: "table",

            cols: 3,
            rows: 3,

            // cellWidth: null,
            // cellHeight: null,

            cellSpaceH: 0,
            cellSpaceV: 0,


        }),
    });

    var bgImg = Images["btn-bg"];
    var img = Images["btn-icon"];
    var comp = tempUI = new CUI.Button({
        backgroundColor: "rgba(255,240,230,1)",
        borderWidth: 2,
        borderColor: "red",

        parent: page,
        width: "100%",
        height: "100%",

        // left: 0,
        // right: 0,
        // top: 0,
        // bottom: 0,
        margin: 10,
        // marginLeft: "30%",
        // marginRight: 30,
        // marginTop: 30,
        // marginBottom: 30,
        // paddingLeft: 20,

        scaleBg: true,
        bgInfo: {
            img: bgImg,
        },

        iconInfo: {
            offsetX: -20,
            img: img,
        },

        textInfo: {
            offsetX: 20,
            // offsetY: -20,
            textAlign: "center",
            text: "Button-1",
            color: "black",
            // shadowOffsetX: 2,
            // shadowOffsetY: 2,
            // shadowColor: "#000000",
            // strokeWidth:4,
            // strokeColor: "red",
        },

        onTap: function(x, y, id) {
            // alert("button: " + this.id)
            console.log(this)
        },

        col: 0,
        row: 0,
        rowspan: 3,
    });

    var comp = new CUI.Button({
        backgroundColor: "rgba(255,240,230,1)",
        borderWidth: 2,
        borderColor: "red",

        parent: page,
        width: "100%",
        height: "100%",
        margin: 10,
        textInfo: {
            text: "Button-2",
        },

        col: 1,
        row: 0,
        colspan: 2,
        rowspan: 2,

    });

    var comp = new CUI.Button({
        backgroundColor: "rgba(255,240,230,1)",
        borderWidth: 2,
        borderColor: "red",

        parent: page,
        width: "100%",
        height: "100%",
        margin: 10,
        textInfo: {
            text: "Button-3",
        },

        col: 1,
        row: 2,
        colspan:2,

    });

    // var comp = new CUI.Picture({
    //     id: "ui-1-" + 0,
    //     left: 0,
    //     top: 0,
    //     backgroundColor: "rgba(100,240,230,1)",
    //     // img: Images["btn-bg"],
    //     src: "res/btn-bg.png",
    //     // width: 30,
    //     height: 60,
    //     margin: 10,
    //     parent: rootUI,
    //     // layout: new CUI.HBoxLayout(),
    // });


}
