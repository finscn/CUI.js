"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Component = exports.Component;
    var ImageRenderer = exports.ImageRenderer;
    var TextRenderer = exports.TextRenderer;

    var Button = Class.create({

        composite: false,
        disabled: false,
        // TODO
        init: function() {

            if (this.bgInfo) {
                this.bgRenderer = new ImageRenderer(this.bgInfo);
                this.bgRenderer.setParent(this);
                this.bgRenderer.init();

                if (this.width === null) {
                    this.width = this.bgRenderer.width || this.bgRenderer.sw;
                }

                if (this.height === null) {
                    this.height = this.bgRenderer.height || this.bgRenderer.sh;
                }
            }

            this.$super.init.call(this);

            if (this.iconInfo) {
                this.iconRenderer = new ImageRenderer(this.iconInfo);
                this.iconRenderer.setParent(this);
                this.iconRenderer.init();
            }
            if (this.textInfo) {
                this.textRenderer = new TextRenderer(this.textInfo);
                this.textRenderer.setParent(this);
                this.textRenderer.init();
            }
        },

        setText: function(text) {
            this.textRenderer.setText(text);
        },
        setTextInfo: function(textInfo) {
            this.textRenderer.setTextInfo(textInfo);
        },

        computeLayout: function(forceCompute) {
            this.bgRenderer && this.bgRenderer.updatePosition();
            this.iconRenderer && this.iconRenderer.updatePosition();
            this.textRenderer && this.textRenderer.updatePosition();
            this.needToCompute = false;

            this.updateAnchor();
        },

        renderSelf: function(context, timeStep, now) {
            if (this.backgroundColor) {
                context.fillStyle = this.backgroundColor;
                context.fillRect(this.x, this.y, this.w, this.h);
            }
            this.bgRenderer && this.bgRenderer.render(context);
            this.iconRenderer && this.iconRenderer.render(context);
            this.textRenderer && this.textRenderer.render(context);
        },

        onTouchStart: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.state = this.downState;

        },

        onTouchMove: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            if (!this.isInRegion(x, y)) {
                this.state = this.normalState;
                return false;
            }
        },

        onTouchEnd: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.state = this.normalState;
        },

        onTap: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.state = this.normalState;
        },

    }, Component);


    exports.Button = Button;

    if (typeof module != "undefined") {
        module.exports = Button;
    }

}(CUI));
