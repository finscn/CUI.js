var app;

function initRenderer() {

    context = canvas.getContext('2d');

    renderer = new CUI.CanvasRenderer({
        context: context
    });
}

function initStage() {


}

function render() {
    renderer.render(rootUI.displayObject);
}
