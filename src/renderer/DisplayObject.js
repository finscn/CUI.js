"use strict";

var CUI = CUI || {};


(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var Point = function(x, y) {
        this.set(x || 0, y || 0);
    };

    Point.prototype.set = function(x, y) {
        this.x = x;
        if (y === undefined) {
            y = x;
        }
        this.y = y;
    };

    var DisplayObject = Class.create({

        initialize: function() {
            this.position = new Point(0, 0);
            this.pivot = new Point(0, 0);
            this.scale = new Point(1, 1);

            this.children = [];

            this.width = 0;
            this.height = 0;
            this.alpha = 1;
            this.rotation = 0;
            this.visible = true;
            this.zIndex = 0;
            this.tint = null;

            this.composite = null;
            this.mask = null;

            this._absoluteAlpha = 1;
            this._ignoreResize = false;
            this.parent = null;

            this.rect = null;
            this.image = null;
            this.borderImage = null;

        },

        addChild: function(child) {
            child.parent = this;
            this.children.push(child);
        },

        addChildAt: function(child, index) {
            if (index < 0 || index > this.children.length) {
                throw new Error('child.addChildAt: The index ' + index + ' supplied is out of bounds ' + this.children.length);
            }

            if (child.parent) {
                child.parent.removeChild(child);
            }

            child.parent = this;

            this.children.splice(index, 0, child);
        },

        removeChild: function(child) {
            var index = this.children.indexOf(child);

            if (index === -1) {
                return null;
            }

            this.children.splice(index, 1);
            child.parent = null;
            return child;
        },

        getChildIndex: function(child) {
            var index = this.children.indexOf(child);

            if (index === -1) {
                throw new Error('The supplied DisplayObject must be a child of the caller');
            }

            return index;
        },

        sortChildren: function() {
            this.children.sort(function(a, b) {
                return a.zIndex - b.zIndex || a.index - b.index;
            });
        },

        destroy: function() {
            this.children.forEach(function(child) {
                child.parent = null;
                if (typeof child.destroy === 'function') {
                    child.destroy();
                }
            });

            this.parent = null;
            this.position = null;
            this.pivot = null;
            this.scale = null;

            this.children = null;
        }

    });

    var properties = [

        {
            key: 'width',
            get: function() {
                return this._width;
            },
            set: function(value) {
                this._width = Math.abs(value);
                if (this.imageInfo) {
                    this.scale.x = Math.abs(this.scale.x) * (value < 0 ? -1 : 1);
                    // this.scale.x = (value / this.imageInfo.sw) || 1;
                }
            }
        },

        {
            key: 'height',
            get: function() {
                return this._height;
            },
            set: function(value) {
                this._height = Math.abs(value);
                if (this.imageInfo) {
                    this.scale.y = Math.abs(this.scale.y) * (value < 0 ? -1 : 1);
                    // this.scale.y = (value / this.imageInfo.sh) || 1;
                }
            }
        },
    ];

    Class.defineProperties(DisplayObject.prototype, properties);


    exports.Point = Point;
    exports.DisplayObject = DisplayObject;

    if (typeof module !== "undefined") {
        module.exports = DisplayObject;
    }

}(CUI));
