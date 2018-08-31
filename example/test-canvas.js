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
    context.fillStyle = "#1099bb";
    context.fillRect(0, 0, canvas.width, canvas.height);
    renderer.render(rootUI.displayObject);
}
