var panelBorderImageInfo;
var buttonBorderImageInfo;

function initTexture() {
    var panelBg = new CUI.PanelBackground({
        width: 320,
        height: 320,
        // bgColor: "rgba(200,200,200,0.8)",
        // bgColor: "#6b696b",
        // bgColor: "rgba(255,255,255,1)",
        color: "rgba(170,170,170,1)",
        radius: 20,
        padding: 6,

        shadowColor: "rgba(255,0,0,1)",
        shadowOffsetX: 0,
        shadowOffsetY: 10,

        headHeight: 40,
        headRadius: [20 - 6, 20 - 6, 0, 0],
        // headMarginTop: 10,
        headMarginBottom: 6,
        headColor: "#1E639E",
        headBorderWidth: 0,
        headBorderColor: "#524539",

        // bodyRadius: [0, 0, 36, 36],
        bodyRadius: [10, 10, 10, 10],
        // bodyColor: "#F4EFED",
        bodyColor: "rgba(255,255,255,1)",
        bodyBorderWidth: 0,
        // bodyBorderColor: "#d3c497",
        // bodyColor: "#e6d9b6",
        // bodyBorderWidth: 2,
        // bodyBorderColor: "#d3c497",
        bodyPadding: 10,

        innerRadius: [20, 20, 20, 20],
        innerColor: "#cccccc",
        // innerColor: "rgba(0,0,0,0)",
        // innerHeight: 60,
        innerBorderWidth: 0,
        innerBorderColor: "#c67e4e",

        footHeight: 40,
        footRadius: [0, 0, 20 - 6, 20 - 6],
        footMarginTop: 15,
        // footMarginBottom: 6,
        footColor: "#1E639E",
        footBorderWidth: 0,
        footBorderColor: "#524539",

    });
    panelBg.init();

    panelBorderImageInfo = {
        img: panelBg.image,
        fill: true,
        T: 100,
        B: 50,
        L: 50,
        R: 50,
    };

    var buttonBg = new CUI.ButtonBackground({
        mode: 1,
        x: 0,
        y: 0,
        width: 90,
        height: 90,
        color: "#11aaf6",
        radius: [12, 12, 12, 12],

        borderWidth: 8,
        borderColor: "#2266cc",

        lightColor: "rgba(250,250,250,0.20)",

        lighterColor: "rgba(255,255,255,0.50)",
        lighterHeight: 5,

        // darkerColor: "rgba(0,0,0,1)",
        // darkerHeight: 5,
        // darkerOffsetY: -5,

        shadowOffsetY: 8,
        shadowColor: "#115599",

        outerBorderWidth: 2,
        outerBorderColor: "#ff3300",
        // outerBorderRadius: 16,

    });
    buttonBg.init();

    var btnBgImg = buttonBg.image;

    buttonBorderImageInfo = {
        img: btnBgImg,
        fill: true,
        T: 35,
        B: 35,
        L: 35,
        R: 35,
    };
}
