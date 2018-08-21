"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Core = exports.Core;
    var noop = exports.noop;

    var Composite = exports.Composite;
    var EventDispatcher = exports.EventDispatcher;
    var TouchTarget = exports.TouchTarget;
    var Layout = exports.Layout;

    var Component = Class.create({
        superclass: Core,

        initialize: function() {

            this.component = true;

            this.anchor = 0.5;

            /////////////////////////////////////////////
            // 对象创建后, 以下属性可更改

            // 以下 6 个属性支持数字(代表像素), 和百分比
            // 百分比时, 相对参照物为 父元素 的实际宽高(像素)
            this.left = null;
            this.top = null;
            this.right = null;
            this.bottom = null;

            this.inView = true;
            this.zIndex = 0;
            this.index = 0;

            this.offsetX = 0;
            this.offsetY = 0;
            this.scrollX = 0;
            this.scrollY = 0;

            this.extLeft = 0;
            this.extRight = 0;
            this.extTop = 0;
            this.extBottom = 0;

            this.layout = null;

            this.modal = false;
            this.maskColor = "#000000";
            this.maskAlpha = 0.50;

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

            this.touchTarget = true;

            this.composite = true;
            this.children = null;
            this.childrenMap = null;
        },

        init: function() {
            this.id = this.id || "cmp_" + Component._SN++;
            // if (this.beforeInit) {
            //     this.beforeInit();
            // }

            // TODO
            // this._beforeInit();

            this.inited = true;

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
            this.backgroundImage = this.backgroundImage || this.backgroundImg || this.bgImg;
            this.initBackgroundImage();

            // TODO
            // this._afterInit();

            // if (this.afterInit) {
            //     this.afterInit();
            // }
        },

        initDisplayObject: function() {
            var displayObject = this.root.renderer.createContainer();
            displayObject._ignoreResize = true;
            this.displayObject = displayObject;
            this.displayObject.pivot.set(this._pivotX, this._pivotY);
            if (this.parent) {
                this.parent.addChildDisplayObject(this);
            }
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
                parent: this,
                color: this.backgroundColor,
                alpha: this.backgroundAlpha,
                fillParent: true,
            });
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
                parent: this,
                alpha: this.borderAlpha,
                lineWidth: this.borderWidth,
                color: this.borderColor,
            });
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
            holder.parent = this;
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
                parent: this,
                img: this.backgroundImage,
                alpha: this.backgroundImageAlpha,
                fillParent: this.scaleBgImg,
                lockScaleRatio: false,
            });
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

        syncPositionX: function() {
            var pixel = this.pixel;
            var parent = this.parent;
            pixel.relativeX = pixel.baseX + this._offsetX - (parent ? parent.scrollX : 0);
            pixel.x = pixel.relativeX + (parent ? parent._absoluteX : 0);
            this.absoluteX = pixel.x;
        },
        syncPositionY: function() {
            var pixel = this.pixel;
            var parent = this.parent;
            pixel.relativeY = pixel.baseY + this._offsetY - (parent ? parent.scrollY : 0);
            pixel.y = pixel.relativeY + (parent ? parent._absoluteY : 0);
            this.absoluteY = pixel.y;
        },

        syncPosition: function() {
            this.syncPositionX();
            this.syncPositionY();

            this.updateAABB();

            if (this.composite) {
                this.children.forEach(function(child) {
                    child.syncPosition();
                });
            }

            this._needToCompute = true;
        },

        moveTo: function(dx, dy) {
            var pixel = this.pixel;

            // TODO

            this.syncPosition();
        },

        moveBy: function(dx, dy) {
            var pixel = this.pixel;

            // TODO

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

        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        computeMargin: function(parent) {
            parent = parent || this.parent;
            if (!parent) {
                return;
            }
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
            if (!parent) {
                return;
            }
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

            pixel.relativeX = pixel.baseX + this._offsetX - (parent ? parent.scrollX : 0);
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
            pixel.baseY = y + pixel.realMarginTop;

            pixel.relativeY = pixel.baseY + this._offsetY - (parent ? parent.scrollY : 0);
            pixel.y = pixel.relativeY + (parent ? parent._absoluteY : 0);
            this.absoluteY = pixel.y;
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

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    var properties = [

        {
            key: 'zIndex',
            get: function() {
                return this._zIndex;
            },
            set: function(value) {
                this._zIndex = value;
                this.displayObject && (this.displayObject.zIndex = value);
                this.parent && (this.parent._toSortChildren = true);
            }
        },

        {
            key: 'anchor',
            get: function() {
                return this._anchor;
            },
            set: function(value) {
                this._anchor = value;

                this._anchorX = value;
                this._pivotX = this._absoluteWidth * this._anchorX;
                this._anchorY = value;
                this._pivotY = this._absoluteHeight * this._anchorY;
                this.displayObject && (this.displayObject.pivot.set(this._pivotX, this._pivotY));
            }
        },

        {
            key: 'anchorX',
            get: function() {
                return this._anchorX;
            },
            set: function(value) {
                this._anchorX = value;
                this._pivotX = this._absoluteWidth * this._anchorX;
                this.displayObject && (this.displayObject.pivot.x = this._pivotX);
            }
        },

        {
            key: 'anchorY',
            get: function() {
                return this._anchorY;
            },
            set: function(value) {
                this._anchorY = value;
                this._pivotY = this._absoluteHeight * this._anchorY;
                this.displayObject && (this.displayObject.pivot.y = this._pivotY);
            }
        },

        {
            key: 'offsetX',
            get: function() {
                return this._offsetX;
            },
            set: function(value) {
                this._offsetX = value;
                this.syncPositionX();
            }
        },

        {
            key: 'offsetY',
            get: function() {
                return this._offsetY;
            },
            set: function(value) {
                this._offsetY = value;
                this.syncPositionY();
            }
        },
    ];

    Class.defineProperties(Component.prototype, properties);

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

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

}(CUI));
