"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var BaseHolder = exports.BaseHolder;

    // visible
    // alpha
    // rotation
    // width (w)
    // height (h)
    // position (x, y)
    // scale
    // anchor

    var properties = [

        {
            key: 'visible',
            get: function() {
                return this._visible;
            },
            set: function(value) {
                this._visible = value;
                this.displayObject && (this.displayObject.visible = value);
            }
        },

        {
            key: 'alpha',
            get: function() {
                return this._alpha;
            },
            set: function(value) {
                this._alpha = value;
                this.displayObject && (this.displayObject.alpha = value);
            }
        },

        {
            key: 'tint',
            get: function() {
                return this._tint;
            },
            set: function(value) {
                this._tint = value;
                if (this.displayObject) {
                    this.displayObject.tint = value === null ? 0xFFFFFF : value;
                }
            }
        },

        {
            key: 'rotation',
            get: function() {
                return this._rotation;
            },
            set: function(value) {
                this._rotation = value;
                this.displayObject && (this.displayObject.rotation = value);
            }
        },

        {
            key: 'x',
            get: function() {
                return this._x;
            },
            set: function(value) {
                this._x = value;
                this.displayObject && (this.displayObject.position.x = value);
            }
        },

        {
            key: 'y',
            get: function() {
                return this._y;
            },
            set: function(value) {
                this._y = value;
                this.displayObject && (this.displayObject.position.y = value);
            }
        },

        {
            key: 'w',
            get: function() {
                return this._w;
            },
            set: function(value) {
                this._w = value;
                this.displayObject && (this.displayObject.width = value);
            }
        },

        {
            key: 'h',
            get: function() {
                return this._h;
            },
            set: function(value) {
                this._h = value;
                this.displayObject && (this.displayObject.height = value);
            }
        },

        {
            key: 'scale',
            get: function() {
                return this._scale;
            },
            set: function(value) {
                this._scale = value;
                this.displayObject && (this.displayObject.scale.set(value, value));
            }
        },

        {
            key: 'scaleX',
            get: function() {
                return this._scaleX;
            },
            set: function(value) {
                this._scaleX = value;
                this.displayObject && (this.displayObject.scale.x = value);
            }
        },

        {
            key: 'scaleY',
            get: function() {
                return this._scaleY;
            },
            set: function(value) {
                this._scaleY = value;
                this.displayObject && (this.displayObject.scale.y = value);
            }
        },

        {
            key: 'anchor',
            get: function() {
                return this._anchor;
            },
            set: function(value) {
                this._anchor = value;
                this.displayObject && (this.displayObject.anchor.set(value, value));
            }
        },

        {
            key: 'anchorX',
            get: function() {
                return this._anchorX;
            },
            set: function(value) {
                this._anchorX = value;
                this.displayObject && (this.displayObject.anchor.x = value);
            }
        },

        {
            key: 'anchorY',
            get: function() {
                return this._anchorY;
            },
            set: function(value) {
                this._anchorY = value;
                this.displayObject && (this.displayObject.anchor.y = value);
            }
        },
    ];

    Class.defineProperties(Component.prototype, properties);
    Class.defineProperties(BaseHolder.prototype, properties);

    var TestCmp = Class.create({
        superclass: Component,
        initialize: function() {
            this.id = "cmp_root";

            this.width = null;
            this.height = null;

            this.left = null;
            this.top = null;
            this.originalX = 0;
            this.originalY = 0;

            this.resetSN = 1;
        },
        init: function() {

        }
    });

    // console.log(Component.prototype)
    console.log(TestCmp.prototype)
    // debugger

    // __defineGetter__
    // __defineSetter__
    // console.log(Component.prototype.__lookupGetter__('visible'))
    // console.log(Component.prototype.__lookupSetter__('visible'))
    // for (var p in Component.prototype) {
    //     fun.prototype[p] = Component.prototype[p];
    // }
    // debugger;
    // var f = new TestCmp();
    // f.visible = true;
    // f.init();
    // console.log(f)
    // debugger

    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////

    var methods = {
        createDisplayObject: function(image, sx, sy, sw, sh, container) {
            var displayObject = this.core.createSprite.apply(this.core, arguments);
            this.displayObject = displayObject;
            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
            // return this.core.createSprite.apply(this.core, arguments);
        },

        addChildDisplayObject: function(child) {
            if (!child) {
                return;
            }
            if (!this.displayObject) {
                // TODO:
            }

            if (child.displayObject) {
                this.displayObject.addChild(child.displayObject);
            }
        },

        removeChildDisplayObject: function(child) {
            if (!child || !this.displayObject) {
                return;
            }

            if (child.displayObject) {
                this.displayObject.removeChild(child.displayObject);
            }
        },
    };

    for (var p in methods) {
        Component.prototype[p] = methods[p];
    }

    for (var p in methods) {
        BaseHolder.prototype[p] = methods[p];
    }

    // if (typeof module !== "undefined") {
    //     // do nothing
    // }

}(CUI));
