var app;

function initRenderer() {

    app = new PIXI.Application({
        forceCanvas: Config.forceCanvas,
        width: Config.width,
        height: Config.height,
        view: canvas,
        backgroundColor: 0x1099bb
    });
    app.stop();

    renderer = new CUI.PIXIRenderer({
        renderer: app.renderer
    });
}

function initStage() {

    app.stage.addChild(rootUI.displayObject);

}

function render() {

    app.renderer.render(app.stage);

}
