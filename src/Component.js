"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Composite = exports.Composite;
    var EventDispatcher = exports.EventDispatcher;
    var TouchTarget = exports.TouchTarget;
    var Layout = exports.Layout;

    var noop = function() {};

    var Component = Class.create({

        id: null,

        /////////////////////////////////////////////
        // 对象创建后, 以下属性可更改

        // 以下 6 个属性支持数字(代表像素), 和百分比
        // 百分比时, 相对参照物为 父元素 的实际宽高(像素)
        left: null,
        top: null,
        right: null,
        bottom: null,
        // 默写组件支持 "auto" , 根据布局和子元素来确定自己的宽高
        width: null,
        height: null,

        visible: true,
        alpha: 1,
        zIndex: 0,
        index: 0,

        // 缩放只适合用来做瞬间的、纯视觉上的动画效果, 它不会改变UI的响应区域和行为
        // 如果要真正改变UI的大小, 请通过修改UI(以及内部元素的)width/height来实现
        scale: 1,
        // 缩放时才需要
        anchorX: "50%",
        anchorY: "50%",

        extLeft: 0,
        extRight: 0,
        extTop: 0,
        extBottom: 0,

        layout: null,
        root: null,
        parent: null,

        modal: false,
        maskColor: "rgba(0,0,0,0.35)",

        displayObject: null,

        /////////////////////////////////////////////
        // 对象创建后, 以下属性不可更改

        centerH: false,
        centerV: false,

        // 子元素的默认对齐方式.  是否有必要? 子元素上定义自己的对齐方式真的很麻烦吗?
        // contentAlignH: "auto", //  "left" "center" "right"
        // contentAlignV: "auto", //  "top" "middle" "bottom"

        // 以下 5 个属性支持数字(代表像素), 和百分比
        // 百分比时, 相对参照物为 自身 的实际宽高(像素)
        padding: null,
        paddingTop: null,
        paddingRight: null,
        paddingBottom: null,
        paddingLeft: null,

        // 以下 5 个属性支持数字(代表像素), 和百分比
        // 百分比时, 相对参照物为 父元素 的实际宽高(像素)
        margin: null,
        marginTop: null,
        marginRight: null,
        marginBottom: null,
        marginLeft: null,


        // relative: "root", // 相对于 root容器 定位, 类似dom的position:absolute
        // relative: "parent", // 相对于 parent容器 定位
        relative: false, // 其他(默认值) :遵循parent容器的layout, left,top按偏移量处理( 类似dom的position:relative )


        backgroundColor: "rgba(200,220,255,1)",
        borderColor: "rgba(30,50,80,1)",
        borderWidth: 2,
        borderImage: null, // { img , ix, iy, iw, ih, top, right, bottom, left }

        ////////////////////////////////////////
        // 以下属性为内部属性, 用户通常不需要关心

        // 绝对定位和大小, 单位:像素
        x: 0,
        y: 0,
        w: 0,
        h: 0,

        aabb: null,
        pixel: null,

        composite: true,
        children: null,
        childrenMap: null,
        needToCompute: true,


        init: function() {

            // if (this.beforeInit) {
            //     this.beforeInit();
            // }

            this.inited = true;
            this.id = this.id || "cmp_" + Component._SN++;
            // Component.addUI(this);

            this.root = this.root || (this.parent && this.parent.root);
            if (this.root){
                this.root.all[this.id] = this;
            }

            this.aabb = [];
            this.pixel = {
                relativeX: 0,
                relativeY: 0,
            };

            EventDispatcher.apply(this);
            TouchTarget.apply(this);

            if (this.composite) {
                Composite.apply(this);
                this.setLayout(this.layout || Layout.commonLayout);
                this.childSN = 0;
            }

            this.setMargin(this.margin || 0);
            this.setPadding(this.padding || 0);
            this.setParent(this.parent, true);

            // if (this.afterInit) {
            //     this.afterInit();
            // }
        },
        beforeInit: null,
        afterInit: null,

        setLayout: function(layout) {
            this.layout = layout;
        },

        setParent: function(parent, forceCompute) {
            if (parent && (parent != this.parent || forceCompute)) {
                this.parent.addChild(this);
            }
        },
        addChild: function(child) {
            if (this.composite) {
                Composite.prototype.addChild.call(this, child);
                // child.parent = this;
                child.root = this.root;
                child.index = this.childSN++;
                if (this.width == "auto") {
                    this.pixel.w = 0;
                }
                if (this.height == "auto") {
                    this.pixel.h = 0;
                }
                this.needToCompute = true;
                this.sortChildren();
            }
        },

        removeChild: function(child) {
            if (this.composite) {
                var rs = Composite.prototype.removeChild.call(this, child);
                if (rs) {
                    if (this.width == "auto") {
                        this.pixel.w = 0;
                    }
                    if (this.height == "auto") {
                        this.pixel.h = 0;
                    }
                    this.needToCompute = true;
                }
            }
        },

        sortChildren: function() {
            this.children.sort(function(a, b) {
                return a.zIndex - b.zIndex || a.index - b.index;
            });
        },

        setZIndex: function(zIndex) {
            this.zIndex = zIndex;
            var p = this.parent || this.root;
            p.sortChildren();
        },

        setMargin: function(margin) {
            this.margin = margin;
            this.marginLeft = this.marginLeft === null ? this.margin : this.marginLeft;
            this.marginTop = this.marginTop === null ? this.margin : this.marginTop;
            this.marginRight = this.marginRight === null ? this.margin : this.marginRight;
            this.marginBottom = this.marginBottom === null ? this.margin : this.marginBottom;
        },

        setPadding: function(padding) {
            this.padding = padding;
            this.paddingLeft = this.paddingLeft === null ? this.padding : this.paddingLeft;
            this.paddingTop = this.paddingTop === null ? this.padding : this.paddingTop;
            this.paddingRight = this.paddingRight === null ? this.padding : this.paddingRight;
            this.paddingBottom = this.paddingBottom === null ? this.padding : this.paddingBottom;
        },


        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        //            以下方法在父元素已经init 并 至少计算过一次之后才可调用
        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////


        setReflow: function(deep) {
            if (!deep) {
                this.needToCompute = false;
                return false;
            }
            if (deep == "root") {
                var root = this.root || this.parent;
                if (root) {
                    root.needToCompute;
                }
            } else if (deep == "parent") {
                var parent = this.parent || this.root;
                if (parent) {
                    parent.needToCompute;
                }
            } else if (deep === true) {
                var stop = false;
                var ui = this;
                while (ui) {
                    ui.needToCompute = true;
                    if (stop || ui.relative == "root") {
                        break;
                    } else if (ui.relative == "parent") {
                        stop = true;
                    }
                    ui = ui.parent;
                }
            } else {
                this.needToCompute = true;
            }

            return true;
        },

        setPosition: function(left, top) {
            if (this.left != left) {
                this.left = left;
                this.computePositionX();
            }
            if (this.top != top) {
                this.top = top;
                this.computePositionY();
            }
            // this.syncPosition();
            this.setReflow("parent");
        },

        setSize: function(width, height, force) {
            if (force || this.width != width) {
                this.width = width;
                this.computeWidth();
            }
            if (force || this.height != height) {
                this.height = height;
                this.computeHeight();
            }
        },

        setAnchor: function(x, y) {
            this.anchorX = x;
            this.anchorY = y;
        },

        updateAnchor: function() {
            this.pixel.anchorX = Utils.parseValue(this.anchorX, this.w) || 0;
            this.pixel.anchorY = Utils.parseValue(this.anchorY, this.h) || 0;
        },

        syncPosition: function() {
            this.x = this.pixel.relativeX + this.parent.x;
            this.y = this.pixel.relativeY + this.parent.y;
            this.updateAABB();

            if (this.composite) {
                this.children.forEach(function(child) {
                    child.syncPosition();
                });
            }
        },

        updateAABB: function() {
            this.aabb[0] = this.x - this.extLeft;
            this.aabb[1] = this.y - this.extTop;
            this.aabb[2] = this.x + this.w + this.extRight;
            this.aabb[3] = this.y + this.h + this.extBottom;
        },

        // 在移动UI时, 可以用以下两个方法 , 更快捷, 但是不严谨.
        // 严谨的方法是调用  setPosition .
        moveTo: function(x, y) {
            this.pixel.relativeX = x;
            this.pixel.relativeY = y;
            this.syncPosition();
        },
        moveBy: function(dx, dy) {
            this.pixel.relativeX += dx;
            this.pixel.relativeY += dy;
            this.syncPosition();
        },

        show: function() {
            this.visible = true;
            this.onShow();
        },
        onShow: noop,

        hide: function() {
            this.visible = false;
            this.onHide();
        },
        onHide: noop,

        /////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////


        setLeft: function(left) {
            if (this.left !== left) {
                this.left = left;
                this.setReflow("parent");
            }
        },
        setRight: function(right) {
            if (this.right !== right) {
                this.right = right;
                this.setReflow("parent");
            }
        },
        setTop: function(top) {
            if (this.top !== top) {
                this.top = top;
                this.setReflow("parent");
            }
        },
        setBottom: function(bottom) {
            if (this.bottom !== bottom) {
                this.bottom = bottom;
                this.setReflow("parent");
            }
        },

        computeSelf: function(parent) {
            this.computeMargin(parent);
            this.computeRealMargin(parent);
            this.computeWidth();
            this.computeHeight();
            this.computePositionX(parent);
            this.computePositionY(parent);
            this.computePadding();
            this.updateAABB();
        },

        computeLayout: function(forceCompute) {
            if (this.composite && (this.needToCompute || forceCompute)) {
                this.needToCompute = false;
                this.layout.compute(this);
            }
        },

        getChildrenCount: function() {
            return this.composite ? this.children.length : 0;
        },

        isInRegion: function(x, y) {
            var aabb = this.aabb;
            return aabb[0] < x && x < aabb[2] && aabb[1] < y && y < aabb[3];
        },

        checkCollideAABB: function(aabb) {
            var aabb2 = this.aabb;
            return aabb[0] < aabb2[2] && aabb[2] > aabb2[0] && aabb[1] < aabb2[3] && aabb[3] > aabb2[1];
        },

        updateSelf: function(timeStep, now) {

        },
        updateChildren: function(timeStep, now) {
            this.children.forEach(function(child) {
                child.update(timeStep, now);
            });
        },
        update: function(timeStep, now) {
            this.computeLayout();
            this.updateSelf(timeStep, now);
            if (this.composite) {
                this.updateChildren(timeStep, now);
            }
            this.onUpdate(timeStep, now);
        },
        onUpdate: noop,

        renderSelf: function(context, timeStep, now) {
            if (this.backgroundColor) {
                context.fillStyle = this.backgroundColor;
                context.fillRect(this.x, this.y, this.w, this.h);
            }
            if (this.borderWidth && this.borderColor) {
                context.lineWidth = this.borderWidth;
                context.strokeStyle = this.borderColor;
                context.strokeRect(this.x, this.y, this.w, this.h);
            }
        },
        renderChildren: function(context, timeStep, now) {
            this.children.forEach(function(child) {
                child.render(context, timeStep, now);
            });
        },

        doRenderScale: function(context, timeStep, now) {
            context.save();
            context.translate(this.x + this.pixel.anchorX, this.y + this.pixel.anchorY);
            context.scale(this.scale, this.scale);
            context.translate(-this.x - this.pixel.anchorX, -this.y - this.pixel.anchorY);
        },
        render: function(context, timeStep, now) {
            if (!this.visible || this.alpha <= 0) {
                return;
            }

            if (this.beforeRender) {
                this.beforeRender(context, timeStep, now);
            }

            if (this.modal) {
                context.fillStyle = this.maskColor;
                var root = this.root;
                context.fillRect(root.x, root.y, root.w, root.h);
            }

            if (this.scale != 1) {
                this.doRenderScale(context, timeStep, now);
            }
            this.renderSelf(context, timeStep, now);
            if (this.composite) {
                this.renderChildren(context, timeStep, now);
            }
            if (this.scale != 1) {
                context.restore();
            }

            if (this.afterRender) {
                this.afterRender(context, timeStep, now);
            }

        },
        beforeRender: null,
        afterRender: null,

        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        computeMargin: function(parent) {
            // parent.pixel.width/height
            parent = parent || this.parent;
            var relativePixel = parent.pixel;
            var pixel = this.pixel;
            this.marginLeft = this.marginLeft === null ? this.margin : this.marginLeft;
            this.marginTop = this.marginTop === null ? this.margin : this.marginTop;
            this.marginRight = this.marginRight === null ? this.margin : this.marginRight;
            this.marginBottom = this.marginBottom === null ? this.margin : this.marginBottom;

            pixel.marginLeft = Utils.parseValue(this.marginLeft, relativePixel.width) || 0;
            pixel.marginRight = Utils.parseValue(this.marginRight, relativePixel.width) || 0;
            pixel.marginTop = Utils.parseValue(this.marginTop, relativePixel.height) || 0;
            pixel.marginBottom = Utils.parseValue(this.marginBottom, relativePixel.height) || 0;
        },

        computeRealMargin: function(parent) {
            // parent.pixel.padding
            parent = parent || this.parent;

            var relativePixel = parent.pixel;
            var pixel = this.pixel;
            pixel.realMarginLeft = Math.max(relativePixel.paddingLeft, pixel.marginLeft) || 0;
            pixel.realMarginTop = Math.max(relativePixel.paddingTop, pixel.marginTop) || 0;
            pixel.realMarginRight = Math.max(relativePixel.paddingRight, pixel.marginRight) || 0;
            pixel.realMarginBottom = Math.max(relativePixel.paddingBottom, pixel.marginBottom) || 0;
            pixel.realOuterWidth = relativePixel.width - pixel.realMarginLeft - pixel.realMarginRight;
            pixel.realOuterHeight = relativePixel.height - pixel.realMarginTop - pixel.realMarginBottom;
        },

        computeWidth: function() {
            var pixel = this.pixel;
            var relativeWidth = pixel.realOuterWidth;
            pixel.width = Utils.parseValue(this.width, relativeWidth);
            pixel.anchorX = Utils.parseValue(this.anchorX, pixel.width) || 0;
            this.w = pixel.width;
        },
        computeHeight: function() {
            var pixel = this.pixel;
            var relativeHeight = pixel.realOuterHeight;
            pixel.height = Utils.parseValue(this.height, relativeHeight);
            pixel.anchorY = Utils.parseValue(this.anchorY, pixel.height) || 0;
            this.h = pixel.height;
        },


        computePadding: function() {
            var pixel = this.pixel;
            this.paddingLeft = this.paddingLeft === null ? this.padding : this.paddingLeft;
            this.paddingTop = this.paddingTop === null ? this.padding : this.paddingTop;
            this.paddingRight = this.paddingRight === null ? this.padding : this.paddingRight;
            this.paddingBottom = this.paddingBottom === null ? this.padding : this.paddingBottom;

            pixel.paddingLeft = Utils.parseValue(this.paddingLeft, pixel.width) || 0;
            pixel.paddingRight = Utils.parseValue(this.paddingRight, pixel.width) || 0;
            pixel.paddingTop = Utils.parseValue(this.paddingTop, pixel.height) || 0;
            pixel.paddingBottom = Utils.parseValue(this.paddingBottom, pixel.height) || 0;
        },

        computePositionX: function(parent) {
            // parent.pixel.innerWidth/innerHeight ( size - Math.max(padding, margin) );
            parent = parent || this.parent;

            var pixel = this.pixel;
            var relativeWidth = pixel.realOuterWidth;

            pixel.left = Utils.parseValue(this.left, relativeWidth);
            pixel.right = Utils.parseValue(this.right, relativeWidth);

            var x = 0;
            if (this.centerH === true) {
                x = (relativeWidth - pixel.width) / 2 + (pixel.left || 0);
            } else if (pixel.left === null && pixel.right !== null) {
                x = relativeWidth - pixel.width - pixel.right;
            } else {
                x = pixel.left;
            }
            pixel.relativeX = x + pixel.realMarginLeft;

            this.x = pixel.relativeX + parent.x;
        },

        computePositionY: function(parent) {
            // parent.pixel.innerWidth/innerHeight ( size - Math.max(padding, margin) );
            parent = parent || this.parent;
            var pixel = this.pixel;
            var relativeHeight = pixel.realOuterHeight;

            pixel.top = Utils.parseValue(this.top, relativeHeight);
            pixel.bottom = Utils.parseValue(this.bottom, relativeHeight);

            var y = 0;
            if (this.centerV === true) {
                y = (relativeHeight - pixel.height) / 2 + (pixel.top || 0);
            } else if (pixel.top === null && pixel.bottom !== null) {
                y = relativeHeight - pixel.height - pixel.bottom;
            } else {
                y = pixel.top;
            }
            pixel.relativeY = y + pixel.realMarginTop;

            this.y = pixel.relativeY + parent.y;
        },



        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////


        destructor: function() {
            if (this.root){
                delete this.root.all[this.id];
                this.root = null;
            }
            this.parent = null;
            this.layout = null;

            // 不会自动显式的销毁子元素. (不会调用子元素的destructor)
            if (this.composite) {
                this.children.forEach(function(child) {
                    child.setParent(child.root);
                })
                this.children = null;
                this.childrenMap = null;
            }
        },
    });


    Component._SN = 0;
    Component.all = {};
    Component.addUI = function(ui) {
        if (!ui) {
            return false;
        }
        Component.all[ui.id] = ui;
        return ui.id;
    };
    Component.getUI = function(id) {
        return Component.all[id];
    };


    exports.Component = Component;
    exports.noop = noop;


}(CUI));
