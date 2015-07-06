"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;

    var Component = Class.create({
        constructor: Component,

        id: null,

        /////////////////////////////////////////////
        // 对象创建后, 以下属性可更改

        left: null,
        top: null,
        right: null,
        bottom: null,
        width: null,
        height: null,

        visible: false,
        alpha: 1,
        scale: 1,
        index: 0,
        zIndex: 0,

        extLeft: 0,
        extRight: 0,
        extTop: 0,
        extBottom: 0,

        layout: null,
        root: null,
        parent: null,

        modal: false,

        /////////////////////////////////////////////
        // 对象创建后, 以下属性不可更改

        centerX: false,
        centerY: false,

        padding: null,
        paddingTop: null,
        paddingRight: null,
        paddingBottom: null,
        paddingLeft: null,

        margin: null,
        marginTop: null,
        marginRight: null,
        marginBottom: null,
        marginLeft: null,


        // relative: "root", // 相对于 root容器 定位, 类似dom的position:absolute
        // relative: "parent", // 相对于 parent容器 定位
        // relative: "self", // 相对于 自己(layout后) 定位, 类似dom的position:relative
        relative: false, // 其他(默认值) :遵循parent容器的layout


        borderColor: null,
        borderWidth: null,
        borderImage: null,

        ////////////////////////////////////////
        // 以下属性为内部属性, 用户通常不需要关心


        pixel: null,

        // 绝对定位和大小, 单位pixel
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        aabb: null,

        children: null,
        childrenMap: null,

        init: function() {
            this.root = this.root || Component.root;
            this.aabb = [];
            this.pixel = {};

            EventDispatcher.apply(this);
            Composite.apply(this);

            this.setParent(this.parent || this.root);

        },

        setParent: function(parent, force) {
            if (parent != this.parent || force) {
                this.parent = parent;
                this.initPixelData();
                // TODO : update
            }
        },

        computeMargin: function() {
            var pixel = this.pixel;
            this.marginLeft = this.marginLeft === null ? this.margin : this.marginLeft;
            this.marginTop = this.marginTop === null ? this.margin : this.marginTop;
            this.marginRight = this.marginRight === null ? this.margin : this.marginRight;
            this.marginBottom = this.marginBottom === null ? this.margin : this.marginBottom;

            pixel.marginLeft = this.parseValue(this.marginLeft, parent.pixel.width);
            pixel.marginRight = this.parseValue(this.marginRight, parent.pixel.width);
            pixel.marginTop = this.parseValue(this.marginTop, parent.pixel.height);
            pixel.marginBottom = this.parseValue(this.marginBottom, parent.pixel.height);
        },

        computePadding: function() {
            var pixel = this.pixel;
            this.paddingLeft = this.paddingLeft === null ? this.padding : this.paddingLeft;
            this.paddingTop = this.paddingTop === null ? this.padding : this.paddingTop;
            this.paddingRight = this.paddingRight === null ? this.padding : this.paddingRight;
            this.paddingBottom = this.paddingBottom === null ? this.padding : this.paddingBottom;

            pixel.paddingLeft = this.parseValue(this.paddingLeft, parent.pixel.width);
            pixel.paddingRight = this.parseValue(this.paddingRight, parent.pixel.width);
            pixel.paddingTop = this.parseValue(this.paddingTop, parent.pixel.height);
            pixel.paddingBottom = this.parseValue(this.paddingBottom, parent.pixel.height);

            pixel.innerWidth = pixel.width - pixel.paddingLeft - pixel.paddingRight;
            pixel.innerHeight = pixel.height - pixel.paddingTop - pixel.paddingBottom;
        },
        computeSize: function(){
            var pixel = this.pixel;
            var parent = this.parent;
            pixel.width = this.parseValue(this.width, parent.innerWidth);
            pixel.height = this.parseValue(this.height, parent.innerHeight);
        },
        computePosition: function(){
            var pixel = this.pixel;
            var parent = this.parent;
            pixel.left = this.parseValue(this.left, parent.innerWidth);
            pixel.top = this.parseValue(this.top, parent.innerHeight);

            pixel.right = this.parseValue(this.right, parent.innerWidth);
            pixel.bottom = this.parseValue(this.bottom, parent.innerHeight);
        },

        computeAbsoluteData: function() {
            var pixel = this.pixel;
            var parent = this.parent;

            var x = 0,
                y = 0;
            if (this.centerX === true) {
                x = (parent.innerWidth - pixel.width) / 2;
            } else if (pixel.left === null && pixel.right !== null) {
                x = parent.innerWidth - pixel.width;
            }
            if (this.centerY === true) {
                y = (parent.innerHeight - pixel.height) / 2;
            } else if (pixel.top === null && pixel.bottom !== null) {
                y = parent.innerHeight - pixel.height;
            }
            this.x = x + pixel.left + parent.x;
            this.y = y + pixel.top + parent.y;
            this.w = pixel.width;
            this.h = pixel.height;

            this.updateAABB();
        },

        updateAABB: function() {
            this.aabb[0] = this.x - this.extLeft;
            this.aabb[1] = this.y - this.extTop;
            this.aabb[2] = this.x + this.w + this.extRight;
            this.aabb[3] = this.y + this.h + this.extBottom;
        },

        parseValue: function(value, relativeValue) {
            if (typeof value == "number" || value === true || value === false || value === null || value === undefined) {
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
            this.root = null;
            this.parent = null;
            this.layout = null;

            // 不会自动显式的销毁子元素.
            this.children.forEach(function(child) {
                child.setParent(child.root);
            })
            this.children = null;
            this.childrenMap = null;
        },
    });


    exports.Component = Component;

    if (typeof module != "undefined") {
        module.exports = Component;
    }

}(CUI));
