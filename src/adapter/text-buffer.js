    createTextObject(context, container) {
        const canvas = context.canvas;
        const texture = PIXI.Texture.fromCanvas(canvas);

        texture.orig = new PIXI.Rectangle();
        texture.trim = new PIXI.Rectangle();

        const sprite = new PIXI.Sprite(texture);

        // sprite.resolution = this.resolution;
        sprite.context = context;
        sprite.canvas = canvas;
        sprite.padding = 0;
        sprite.updateSize = this._updateTextSize;
        sprite.updateContent = this._updateTextContent;

        return sprite;
    }

    _updateTextContent() {
        const texture = this._texture;

        this._textureID = -1;
        texture.baseTexture.emit('update', texture.baseTexture);
    }

    _updateTextSize() {
        const texture = this._texture;

        texture.baseTexture.hasLoaded = true;
        texture.baseTexture.resolution = this.resolution;
        texture.baseTexture.realWidth = this.canvas.width;
        texture.baseTexture.realHeight = this.canvas.height;
        texture.baseTexture.width = this.canvas.width / this.resolution;
        texture.baseTexture.height = this.canvas.height / this.resolution;
        texture.trim.width = texture._frame.width = this.canvas.width / this.resolution;
        texture.trim.height = texture._frame.height = this.canvas.height / this.resolution;

        texture.trim.x = -this.padding;
        texture.trim.y = -this.padding;

        texture.orig.width = texture._frame.width - (this.padding * 2);
        texture.orig.height = texture._frame.height - (this.padding * 2);

        // call sprite onTextureUpdate to update scale if _width or _height were set
        this._onTextureUpdate();

        texture.baseTexture.emit('update', texture.baseTexture);
    }
