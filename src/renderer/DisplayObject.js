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

        removeChild: function(child) {
            var index = this.children.indexOf(child);

            if (index === -1) {
                return null;
            }

            this.children.splice(index, 1);
            child.parent = null;
            return child;
        },

        sortChildren: function(){
            this.children.sort(function(a, b) {
                return a.zIndex - b.zIndex || a.index - b.index;
            });
        },

        destory: function() {
            this.children.forEach(function(child) {
                child.parent = null;
                if (typeof child.destory === 'function') {
                    child.destory();
                }
            });

            this.parent = null;
            this.position = null;
            this.pivot = null;
            this.scale = null;

            this.children = null;
        }

    });

    exports.Point = Point;
    exports.DisplayObject = DisplayObject;

    if (typeof module !== "undefined") {
        module.exports = DisplayObject;
    }

}(CUI));
