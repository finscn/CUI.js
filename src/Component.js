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

        initialize: function() {

            this.id = null;
            this.lazyInit = false;

            // 以像素为单位的定位和大小, 单位:像素
            this.pixel = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                baseX: 0,
                baseY: 0,
                relativeX: 0,
                relativeY: 0,

                paddingLeft: 0,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,

                marginLeft: 0,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,

                realMarginLeft: 0,
                realMarginTop: 0,
                realMarginRight: 0,
                realMarginBottom: 0,

                realOuterWidth: 0,
                realOuterHeight: 0,
            };

            /////////////////////////////////////////////
            // 对象创建后, 以下属性可更改

            // 以下 6 个属性支持数字(代表像素), 和百分比
            // 百分比时, 相对参照物为 父元素 的实际宽高(像素)
            this.left = null;
            this.top = null;
            this.right = null;
            this.bottom = null;
            // 默写组件支持 "auto" , 根据布局和子元素来确定自己的宽高
            // 支持 混合单位, 如 "100% - 25" , 意思为 父容器的100%再减去25像素.
            this.width = null;
            this.height = null;

            this.alpha = 1;
            this.tint = null;

            this.visible = true;
            this.zIndex = 0;
            this.index = 0;

            // 缩放只适合用来做瞬间的、纯视觉上的动画效果, 它不会改变UI的响应区域和行为
            // 如果要真正改变UI的大小, 请通过修改UI(以及内部元素的)width/height来实现
            this.scale = 1;
            this.scaleX = 1;
            this.scaleY = 1;

            this.rotation = 0;

            this._absoluteWidth = 0;
            this._absoluteHeight = 0;
            this._pivotX = 0;
            this._pivotY = 0;

            // 缩放/旋转 时才需要
            this.anchor = 0.5;
            this.anchorX = 0.5;
            this.anchorY = 0.5;

            this.offsetX = 0;
            this.offsetY = 0;

            this.extLeft = 0;
            this.extRight = 0;
            this.extTop = 0;
            this.extBottom = 0;

            this.layout = null;
            this.root = null;
            this.parent = null;

            this.modal = false;
            this.maskColor = "#000000";
            this.maskAlpha = 0.50;

            this.displayObject = null;
            this.transform = null;

            /////////////////////////////////////////////
            // 对象创建后, 以下属性不可更改

            this.centerH = false;
            this.centerV = false;

            // 子元素的默认对齐方式.  是否有必要? 子元素上定义自己的对齐方式真的很麻烦吗?
            // this.contentAlignH = "auto", //  "left" "center" "right;
            // this.contentAlignV = "auto", //  "top" "middle" "bottom;

            // 以下 5 个属性支持数字(代表像素), 和百分比
            // 百分比时, 相对参照物为 自身 的实际宽高(像素)
            this.padding = null;
            this.paddingTop = null;
            this.paddingRight = null;
            this.paddingBottom = null;
            this.paddingLeft = null;

            // 以下 5 个属性支持数字(代表像素), 和百分比
            // 百分比时, 相对参照物为 父元素 的实际宽高(像素)
            this.margin = null;
            this.marginTop = null;
            this.marginRight = null;
            this.marginBottom = null;
            this.marginLeft = null;


            // relative: "root", // 相对于 root容器 定位, 类似dom的position:absolute
            // relative: "parent", // 相对于 parent容器 定位
            this.relative = false; // 其他(默认值) :遵循parent容器的layout, left,top按偏移量处理( 类似dom的position:relative )

            this.backgroundColor = null; //"rgba(200,220,255,1)";
            this.backgroundAlpha = 1;
            this.backgroundImage = null;
            this.backgroundImageAlpha = 1;
            this.backgroundInfo = null;

            this.scaleBgImg = true;

            // this.borderColor = "rgba(30,50,80,1)";
            this.borderColor = null;
            this.borderAlpha = 1;
            this.borderWidth = 0;
            this.borderImageInfo = null; // { img , sx, sy, sw, sh, top, right, bottom, left }
            this.cacheBorderImage = false;

            ////////////////////////////////////////
            // 以下属性为内部属性, 用户通常不需要关心


            // 绝对定位和大小, 单位:像素
            this.absoluteX = 0;
            this.absoluteY = 0;
            this.absoluteWidth = 0;
            this.absoluteHeight = 0;

            this.aabb = null;

            this.touchTarget = true;

            this.composite = true;
            this.children = null;
            this.childrenMap = null;

            this.useCache = false;
            this.readyForCache = false;
            this.cached = false;

            this._needToCompute = true;
        },

        init: function() {
            // if (this.beforeInit) {
            //     this.beforeInit();
            // }

            // TODO
            // this._beforeInit();

            this.inited = true;
            this.id = this.id || "cmp_" + Component._SN++;

            this.aabb = [];
            this.holders = [];

            this._defaultAlpha = this.alpha;

            if (this.parent) {
                this.parent.addChild(this);
            }

            EventDispatcher.applyTo(this);

            if (this.touchTarget) {
                TouchTarget.applyTo(this);
            }

            if (this.composite) {
                this.all = {};
                Composite.applyTo(this);
                this.setLayout(this.layout);
                this.childSN = 0;
            }

            this.setMargin(this.margin || 0);
            this.setPadding(this.padding || 0);

            this.computeSelf();
            this.initDisplayObject();

            this.initBackgroundColor();
            this.initBorder();
            this.initBorderImage();
            this.backgroundImage = this.backgroundImage || this.bgImg;
            this.initBackgroundImage();

            // TODO
            // this._afterInit();

            // if (this.afterInit) {
            //     this.afterInit();
            // }
        },

        initDisplayObject: function() {
            // do nothing.
        },
        updateDisplayObject: function(img, x, y, w, h) {
            // do nothing.
        },

        setDisabled: function(disabled) {
            this.disabled = disabled;
        },

        initBackgroundColor: function() {
            if (this.backgroundColor === null) {
                this.backgroundHolder = null;
                return;
            }
            var holder = new CUI.BackgroundHolder({
                color: this.backgroundColor,
                alpha: this.backgroundAlpha,
                fillParent: true,
            });
            holder.setParent(this);
            holder.init();
            this.backgroundHolder = holder;
            this._needToCompute = true;
        },

        initBorder: function() {
            if (this.borderColor === null || this.borderWidth <= 0) {
                this.borderHolder = null;
                return;
            }
            var holder = new CUI.BorderHolder({
                alpha: this.borderAlpha,
                lineWidth: this.borderWidth,
                color: this.borderColor,
            });
            holder.setParent(this);
            holder.init();
            this.borderHolder = holder;
            this._needToCompute = true;
        },

        initBorderImage: function(info) {
            var info = this.borderImageInfo;
            if (!info) {
                this.borderImageHolder = null;
                return;
            }
            var holder = new CUI.BorderImageHolder(info);
            holder.setParent(this);
            holder.init();
            this.borderImageHolder = holder;
            this._needToCompute = true;
        },

        initBackgroundImage: function() {
            if (!this.backgroundImage) {
                this.backgroundImageHolder = null;
                return;
            }
            var holder = new CUI.ImageHolder({
                img: this.backgroundImage,
                alpha: this.backgroundImageAlpha,
                fillParent: this.scaleBgImg,
                lockScaleRatio: false,
            });
            holder.setParent(this);
            holder.init();
            this.backgroundImageHolder = holder;
            this._needToCompute = true;
        },

        beforeInit: null,
        afterInit: null,

        _beforeInit: noop,
        _afterInit: noop,

        setLayout: function(layout) {
            var name, options;
            if (typeof layout === "string") {
                name = layout;
            } else if (layout && layout.constructor === Object) {
                var name = layout.name;
                options = layout;
            }
            if (name) {
                switch (name) {
                    case "vbox":
                        layout = new CUI.VBoxLayout(options);
                        break;
                    case "hbox":
                        layout = new CUI.HBoxLayout(options);
                        break;
                    case "table":
                        layout = new CUI.TableLayout(options);
                        break;
                    default:
                        layout = new CUI.BaseLayout(options);
                        break;
                }
            }
            if (!layout) {
                layout = Layout.commonLayout;
            }
            this.layout = layout;
        },

        setRoot: function(root) {
            if (!root) {
                if (this.root) {
                    delete this.root.all[this.id];
                    this.root = null;
                }
                return;
            }

            this.root = root;

            var _comp = root.all[this.id];
            if (_comp !== this) {
                root.all[this.id] = this;
                if (_comp) {
                    console.log("Duplicate id : " + this.id);
                }
            }
        },

        addChild: function(child) {
            if (this.composite) {
                Composite.prototype.addChild.call(this, child);
                child.index = this.childSN++;

                child.setRoot(this.root);
                if (this.width === "auto") {
                    this.pixel.width = 0;
                }
                if (this.height === "auto") {
                    this.pixel.height = 0;
                }
                this._needToCompute = true;
                this.sortChildren();
            }
        },

        removeChild: function(child) {
            var removed = false;
            if (this.composite) {
                removed = Composite.prototype.removeChild.call(this, child);
                if (removed) {
                    child.setRoot(null);
                    if (this.width === "auto") {
                        this.pixel.width = 0;
                    }
                    if (this.height === "auto") {
                        this.pixel.height = 0;
                    }
                    this._needToCompute = true;
                }
            }
            return removed;
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


        setReflow: function(deep, immediately) {
            if (!deep) {
                this._needToCompute = false;
                return false;
            }
            if (deep === "root") {
                var root = this.root || this.parent;
                if (root) {
                    root._needToCompute = true;
                    if (immediately) {
                        root.computeLayout(true);
                    }
                }
            } else if (deep === "parent") {
                var parent = this.parent || this.root;
                if (parent) {
                    parent._needToCompute = true;
                    if (immediately) {
                        parent.computeLayout(true);
                    }
                }
            } else if (deep === true) {
                var stop = false;
                var ui = this;
                var top;
                while (ui) {
                    top = ui;
                    ui._needToCompute = true;
                    if (stop || ui.relative === "root") {
                        break;
                    } else if (ui.relative === "parent") {
                        stop = true;
                    }
                    ui = ui.parent;
                }
                if (immediately) {
                    top.computeLayout(true);
                }
            } else {
                this._needToCompute = true;
                if (immediately) {
                    this.computeLayout();
                }
            }

            return true;
        },

        setPosition: function(left, top) {
            if (this.left !== left && left !== null) {
                this.left = left;
            }
            if (this.top !== top && top !== null && top !== undefined) {
                this.top = top;
            }
            this.setReflow("parent");
        },

        setSize: function(width, height, force) {
            if (force || this.width !== width) {
                this.width = width;
                this.computeWidth();
            }
            if (force || this.height !== height) {
                this.height = height;
                this.computeHeight();
            }
        },

        updateAABB: function() {
            this.aabb[0] = this._absoluteX - this.extLeft;
            this.aabb[1] = this._absoluteY - this.extTop;
            this.aabb[2] = this._absoluteX + this._absoluteWidth + this.extRight;
            this.aabb[3] = this._absoluteY + this._absoluteHeight + this.extBottom;
        },

        updateHolders: function() {
            if (this.backgroundHolder) {
                this.backgroundHolder.updateSize();
                this.backgroundHolder.updatePosition();
                this.backgroundHolder.update();
            }

            if (this.borderHolder) {
                this.borderHolder.updateSize();
                this.borderHolder.updatePosition();
                this.borderHolder.update();
            }

            if (this.borderImageHolder) {
                this.borderImageHolder.updateSize();
                this.borderImageHolder.updatePosition();
                this.borderImageHolder.update();
            }

            if (this.backgroundImageHolder) {
                this.backgroundImageHolder.updateSize();
                this.backgroundImageHolder.updatePosition();
                this.backgroundImageHolder.update();
            }

            this.holders.forEach(function(holder) {
                if (holder) {
                    holder.updateSize();
                    holder.updatePosition();
                    holder.update();
                }
            });
        },

        syncPosition: function() {
            var relativeObj = this.parent || this.root;
            var pixel = this.pixel;

            pixel.x = pixel.relativeX + relativeObj.absoluteX;
            this.absoluteX = pixel.x;

            pixel.y = pixel.relativeY + relativeObj.absoluteY;
            this.absoluteY = pixel.y;

            // this.computePositionX();
            // this.computePositionY();

            this.updateAABB();

            this.updateHolders();

            if (this.composite) {
                this.children.forEach(function(child) {
                    child.syncPosition();
                });
            }
        },

        // 在移动UI时, 可以用以下两个方法 , 更快捷, 但是不严谨.
        // 严谨的方法是调用  setPosition .
        // TODO
        moveToX: function(x) {
            var pixel = this.pixel;
            pixel.left = x;
            pixel.relativeX = x + pixel.realMarginLeft;

            this.syncPosition();
        },
        moveToY: function(y) {
            var pixel = this.pixel;
            pixel.top = y;
            pixel.relativeY = y + pixel.realMarginTop;

            this.syncPosition();
        },
        moveTo: function(x, y) {
            var pixel = this.pixel;
            pixel.left = x;
            pixel.relativeX = x + pixel.realMarginLeft;
            pixel.top = y;
            pixel.relativeY = y + pixel.realMarginTop;

            this.syncPosition();
        },
        moveBy: function(dx, dy) {
            var pixel = this.pixel;
            var x = pixel.relativeX - pixel.realMarginLeft + dx;
            pixel.left = x;
            pixel.relativeX = x + pixel.realMarginLeft;
            // this.left = x;

            var y = pixel.relativeY - pixel.realMarginTop + dy;
            pixel.top = y;
            pixel.relativeY = y + pixel.realMarginTop;
            // this.top = y;

            this.syncPosition();
        },

        show: function() {
            if (this.visible) {
                return false;
            }
            this.visible = true;

            // TODO
            this.update(0);

            this.onShow();
            return true;
        },
        onShow: noop,

        hide: function() {
            if (!this.visible) {
                return false;
            }
            this.visible = false;
            this.onHide();
            return true;
        },
        onHide: noop,

        toggle: function() {
            if (this.visible) {
                return this.hide();
            }
            return this.show();
        },

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

        resize: function() {
            // console.log('Component.resize');
            this.computeWidth();
            this.computeHeight();
            this.computePositionX();
            this.computePositionY();
            this.computePadding();
            this.updateAABB();
            this._needToCompute = true;
            this.onResize();
        },
        onResize: noop,

        computeSelf: function(parent) {
            // console.log('Component.computeSelf', this.id);
            parent = parent || this.parent;

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
            if (this._needToCompute || forceCompute) {
                this._needToCompute = false;
                if (this.composite) {
                    this.layout.compute(this);
                }

                this.updateHolders();
            }
        },

        getChildrenCount: function() {
            return this.composite ? this.children.length : 0;
        },

        isInView: function() {
            return this.checkCollideAABB(this.root.aabb);
        },

        isInRegion: function(x, y, width, height) {
            var aabb = this.aabb;
            return aabb[2] > x && aabb[3] > y && aabb[1] < (y + height) && aabb[0] < (x + width);

        },

        containPoint: function(x, y) {
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
            this.beforeUpdate && this.beforeUpdate(timeStep, now);
            this.computeLayout();
            this.updateSelf(timeStep, now);
            if (this.composite && this.visible) {
                this.updateChildren(timeStep, now);
            }
            this.afterUpdate && this.afterUpdate(timeStep, now);
        },
        beforeUpdate: null,
        afterUpdate: null,

        createCacheCanvas: function() {
            if (!this.cacheCanvas) {
                var canvas = Component.getCanvasFromPool(this.id);
                canvas.width = this._absoluteWidth + 4;
                canvas.height = this._absoluteHeight + 4;
                this.cacheCanvas = canvas;
            }
            var cacheContext = this.cacheCanvas.getContext("2d");

            var useCache = this.useCache;
            var visible = this.visible;
            this.useCache = false;
            this.visible = true;

            // TODO

            this.useCache = useCache;
            this.visible = visible;
            this.cached = true;
        },


        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        computeMargin: function(parent) {
            parent = parent || this.parent;
            var parentPixel = parent.pixel;
            var pixel = this.pixel;
            this.marginLeft = this.marginLeft === null ? this.margin : this.marginLeft;
            this.marginTop = this.marginTop === null ? this.margin : this.marginTop;
            this.marginRight = this.marginRight === null ? this.margin : this.marginRight;
            this.marginBottom = this.marginBottom === null ? this.margin : this.marginBottom;

            pixel.marginLeft = Utils.parseValue(this.marginLeft, parentPixel.width) || 0;
            pixel.marginRight = Utils.parseValue(this.marginRight, parentPixel.width) || 0;
            pixel.marginTop = Utils.parseValue(this.marginTop, parentPixel.height) || 0;
            pixel.marginBottom = Utils.parseValue(this.marginBottom, parentPixel.height) || 0;
        },

        computeRealMargin: function(parent) {
            // parent.pixel.padding
            parent = parent || this.parent;
            var parentPixel = parent.pixel;
            var pixel = this.pixel;
            pixel.realMarginLeft = Math.max(parentPixel.paddingLeft, pixel.marginLeft) || 0;
            pixel.realMarginTop = Math.max(parentPixel.paddingTop, pixel.marginTop) || 0;
            pixel.realMarginRight = Math.max(parentPixel.paddingRight, pixel.marginRight) || 0;
            pixel.realMarginBottom = Math.max(parentPixel.paddingBottom, pixel.marginBottom) || 0;
            pixel.realOuterWidth = parentPixel.width - pixel.realMarginLeft - pixel.realMarginRight;
            pixel.realOuterHeight = parentPixel.height - pixel.realMarginTop - pixel.realMarginBottom;
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

            pixel.innerWidth = pixel.width - pixel.paddingLeft - pixel.paddingRight;
            pixel.innerHeight = pixel.height - pixel.paddingTop - pixel.paddingBottom;
        },

        getFillWidth: function(relativeWidth) {
            if (this.left !== null && this.right !== null) {
                this.width = null;
                var _left = Utils.parseValue(this.left, relativeWidth);
                var _right = Utils.parseValue(this.right, relativeWidth);
                return relativeWidth - _left - _right;
            }
            return null;
        },
        getFillHeight: function(relativeHeight) {
            if (this.top !== null && this.bottom !== null) {
                this.height = null;
                var _top = Utils.parseValue(this.top, relativeHeight);
                var _bottom = Utils.parseValue(this.bottom, relativeHeight);
                return relativeHeight - _top - _bottom;
            }
            return null;
        },

        computAutoWidth: function() {
            this.pixel.width = 0;
        },
        computeWidth: function() {
            var pixel = this.pixel;
            if (this.width === "auto") {
                this.computAutoWidth();
                this.absoluteWidth = pixel.width;
                return;
            }
            var relativeWidth = pixel.realOuterWidth;

            var fillWidth = this.getFillWidth(relativeWidth);
            if (fillWidth !== null) {
                pixel.width = fillWidth;
            } else {
                pixel.width = Utils.parseValue(this.width, relativeWidth);
            }

            pixel.innerWidth = pixel.width - pixel.paddingLeft - pixel.paddingRight;
            this.absoluteWidth = pixel.width;
        },

        computAutoHeight: function() {
            this.pixel.height = 0;
        },
        computeHeight: function() {
            var pixel = this.pixel;

            if (this.height === "auto") {
                this.computAutoHeight();
                this.absoluteHeight = pixel.height;
                return;
            }

            var relativeHeight = pixel.realOuterHeight;

            var fillHeight = this.getFillHeight(relativeHeight);
            if (fillHeight !== null) {
                pixel.height = fillHeight;
            } else {
                pixel.height = Utils.parseValue(this.height, relativeHeight);
            }

            pixel.innerHeight = pixel.height - pixel.paddingTop - pixel.paddingBottom;
            this.absoluteHeight = pixel.height;
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
                x = pixel.left || 0;
            }
            pixel.baseX = x + pixel.realMarginLeft;

            pixel.relativeX = pixel.baseX + this._offsetX;
            pixel.x = pixel.relativeX + (parent ? parent._absoluteX : 0);
            this.absoluteX = pixel.x;
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
                y = pixel.top || 0;
            }
            pixel.relativeY = y + pixel.realMarginTop;
            pixel.y = pixel.relativeY + (parent ? parent._absoluteY : 0);
            this.absoluteY = pixel.y;
        },

        useCacheCanvas: function() {
            // TOTO

        },

        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        destructor: function() {
            if (this.root) {
                delete this.root.all[this.id];
                this.root = null;
            }
            this.parent = null;
            this.layout = null;

            // 不会自动显式的销毁子元素. (不会调用子元素的destructor)
            if (this.composite) {
                this.children.forEach(function(child) {
                    child.parent = null;
                    child.root = null;
                });
                this.children = null;
                this.childrenMap = null;
            }

            // TODO
        },
    });

    Component._SN = 0;

    Component.canvasPool = {};
    Component.getCanvasFromPool = function(id) {
        var canvas = Component.canvasPool[id];
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = id;
            canvas.width = 3;
            canvas.height = 3;
            // canvas.holderId = id;
            Component.canvasPool[id] = canvas;
        }
        return canvas;
    };

    Component.create = function(options, parent) {
        var ui = options.ui;
        var children = options.children;
        delete options.ui;
        delete options.children;

        options.parent = parent;

        var comp = new ui(options);

        if (children) {
            children.forEach(function(child) {
                Component.create(child, comp);
            });
        }
        return comp;
    };

    exports.Component = Component;
    exports.noop = noop;

}(CUI));
