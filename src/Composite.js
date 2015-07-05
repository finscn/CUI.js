"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var Composite = Class.create({

        addChild: function(child) {
            child.id = (child.id || child.id === 0) ? child.id : Composite.generateId();
            this.childrenMap[child.id] = child;
            this.children.push(child);
            child.parent = this;
        },
        getChildById: function(id) {
            return this.childrenMap[id];
        },
        getChildAt: function(index) {
            return this.children[index];
        },
        removeChild: function(child) {
            var index = this.indexOf(child);
            if (index >= 0) {
                delete this.childrenMap[child.id];
                this.children.splice(index, 1);
                child.parent = null;
                return child;
            }
            return false;
        },
        removeChildById: function(id) {
            var child = this.childrenMap[id];
            if (child) {
                return this.removeChild(child);
            }
            return false;
        },
        removeChildAt: function(index) {
            var child = this.children[index];
            if (child) {
                delete this.childrenMap[child.id];
                this.children.splice(index, 1);
                child.parent = null;
                return child;
            }
            return false;
        },
        indexOf: function(child) {
            for (var i = 0, len = this.children.length; i < len; i++) {
                if (this.children[i] === child) {
                    return i;
                }
            }
            return -1;
        },
        hasChild: function(child) {
            return !!this.children[child.id];
        },
        sortChildrenBy: function(key) {
            Composite.insertSort(this.children, key);
        }
    });

    Composite._ID_SEED = 0;
    Composite.generateId = function() {
        Composite._ID_SEED++;
        var id = "comp_" + Composite._ID_SEED;
        return id;
    };

    Composite.insertSort = function(array, sortKey) {
        var t1, t2;
        var count = array.length;
        for (var i = 1; i < count; i++) {
            t1 = array[i];
            var sortValue = t1[sortKey];
            for (var j = i; j > 0 && (t2 = array[j - 1])[sortKey] > sortValue; j--) {
                array[j] = t2;
            }
            array[j] = t1;
        }
    };

    Composite.apply = function(object, override) {
        var proto = Composite.prototype;
        // override = override !== false;
        for (var p in proto) {
            var v = proto[p];
            if (typeof v == "function") {
                (override || !object[p]) && (object[p] = v);
            }
        }
        (override || !object["children"]) && (object.children = []);
        (override || !object["childrenMap"]) && (object.childrenMap = {});
        return object;
    };


    exports.Composite = Composite;

    if (typeof module != "undefined") {
        module.exports = Composite;
    }

}(CUI));
