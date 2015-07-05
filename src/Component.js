"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var Component = Class.create({
        constructor: Component,

        id: null,

        left: null,
        top: null,
        right: null,
        bottom: null,
        width: null,
        height: null,
        centerX: null,
        centerY: null,

        visible: false,
        alpha: 1,
        scale: 1,

        // relative: "root", // 相对于 root容器 定位
        // relative: "parent", // 相对于 parent容器 定位
        // relative: "self", // 相对于 自己(layout后) 定位
        relative: false, // 其他 :遵循parent容器的layout

        index: 0,
        zIndex: 0,

        borderColor: null,
        borderWidth: null,
        borderImage: null,


        padding: null,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,

        margin: null,
        marginTop: null,
        marginRight: null,
        marginBottom: null,
        marginLeft: null,


        // 单位px
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        aabb: null,

        layout: null,
        root: null,
        parent: null,
        children: null,
        childrenMap: null,

        init: function() {
            this.root = this.root || Component.root;
            this.parent = this.parent || this.root;

            EventDispatcher.apply(this);
            Composite.apply(this);
        },

        parseValue: function(value, relativeValue) {
            if (typeof value == "number" || value === null || value === undefined) {
                return value;
            }
            value = String(value);
            if (value.indexOf("%") > 0) {
                value = (parseFloat(value) / 100) * (relativeValue || 0);
                return value;
            }
            return parseFloat(value);
        },

        moveTo: function(x, y) {

            this.positionChanged = true;
        },
        setSize: function(width, height) {

            this.sizeChanged = true;
        },

        updateSelf: function(timeStep, now) {

        },
        updateChildren: function(timeStep, now) {

        },
        update: function(timeStep, now) {
            this.updateSelf(timeStep, now);
            this.updateChildren(timeStep, now);
        },

        renderSelf: function(conttext, timeStep, now) {

        },
        renderChildren: function(conttext, timeStep, now) {

        },
        render: function(conttext, timeStep, now) {
            this.renderSelf(conttext, timeStep, now);
            this.renderChildren(conttext, timeStep, now);
        },

        destructor: function() {

        },
    });


    exports.Component = Component;

    if (typeof module != "undefined") {
        module.exports = Component;
    }

}(CUI));
