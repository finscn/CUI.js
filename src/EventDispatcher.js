"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var EventDispatcher = Class.create({
        constructor: EventDispatcher,

        _listeners: null,

        removeAllEventListeners: function() {
            for (var type in this._listeners) {
                this._listeners[type] = null;
            }
            this._listeners = {};
        },

        addEventListener: function(type, listener) {
            var listeners = this._listeners;
            if (listeners[type] === undefined) {
                listeners[type] = [];
            }
            if (listeners[type].indexOf(listener) === -1) {
                listeners[type].push(listener);
            }
        },

        hasEventListener: function(type, listener) {
            var listeners = this._listeners;
            if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {
                return true;
            }
            return false;
        },

        removeEventListener: function(type, listener) {
            var listeners = this._listeners[type];
            if (listeners !== undefined) {
                var index = listeners.indexOf(listener);
                if (index !== -1) {
                    listeners.splice(index, 1);
                    return listener;
                }
            }
            return null;
        },

        dispatch: function(type, args) {
            var listeners = this._listeners[type];
            var dispatched = false;
            // console.log(type)
            if (listeners) {
                args = Array.prototype.slice.call(arguments, 1);
                for (var i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].apply(this, args);
                    dispatched = true;
                }
            }
            return dispatched;
        },

        getEventListeners: function(type) {
            if (!type) {
                return this._listeners;
            }
            return this._listeners[type];
        },

        removeEventListeners: function(type) {
            if (!type) {
                var ls = this._listeners;
                this._listeners = {};
                return ls;
            }
            var ls = this._listeners[type] || null;
            if (ls) {
                this._listeners[type] = [];
            }
            return ls;
        },

    });

    EventDispatcher.apply = function(object, override) {
        var proto = EventDispatcher.prototype;
        // override = override !== false;
        for (var p in proto) {
            var v = proto[p];
            if (typeof v == "function") {
                (override || !object[p]) && (object[p] = v);
            }
        }
        (override || !object["_listeners"]) && (object._listeners = {});
        return object;
    };

    exports.EventDispatcher = EventDispatcher;

    if (typeof module != "undefined") {
        module.exports = EventDispatcher;
    }

}(CUI));
