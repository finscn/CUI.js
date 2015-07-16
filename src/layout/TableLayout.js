"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var TableLayout = Class.create({
        constructor: TableLayout,

        cellWidth: null,
        cellHeight: null,

        cellSpaceH: null,
        cellSpaceV: null,

        cols: 1,
        rows: 1,

        compute: function(parent) {
            var children = parent.children;

            var idx = 0;
            this.initTable(parent);

            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                if (child.relative == "parent") {
                    this.computeChild(child, child.parent)
                } else if (child.relative == "root") {
                    this.computeChild(child, child.root)
                } else {
                    this.parseChild(child, parent, idx);
                    idx++;
                }
                child.computeLayout(true);
            }

            return idx;
        },

        initTable: function(parent) {
            var pixel = this.pixel = {};
            var parentPixel = parent.pixel;

            pixel.cellSpace = Utils.parseValue(this.cellSpace, parentPixel.width) || 0;
            pixel.cellSpaceH = Utils.parseValue(this.cellSpaceH, parentPixel.width);
            pixel.cellSpaceV = Utils.parseValue(this.cellSpaceV, parentPixel.height);

            if (pixel.cellSpaceH === null) {
                pixel.cellSpaceH = pixel.cellSpace;
            }
            if (pixel.cellSpaceV === null) {
                pixel.cellSpaceV = pixel.cellSpace;
            }

            var innerWidth = parentPixel.width - parentPixel.paddingLeft - parentPixel.paddingRight;
            var innerHeight = parentPixel.height - parentPixel.paddingTop - parentPixel.paddingBottom;

            innerWidth -= pixel.cellSpaceH;
            innerHeight -= pixel.cellSpaceV;

            if (!this.cellWidth) {
                pixel.cellWidth = innerWidth / (this.cols || 1);
            } else {
                pixel.cellWidth = Utils.parseValue(this.cellWidth, innerWidth) || innerWidth;
            }
            if (!this.cols) {
                this.cols = innerWidth / pixel.cellWidth;
            }

            if (!this.cellHeight) {
                pixel.cellHeight = innerHeight / (this.rows || 1);
            } else {
                pixel.cellHeight = Utils.parseValue(this.cellHeight, innerHeight) || innerHeight;
            }
            if (!this.rows) {
                this.rows = innerHeight / pixel.cellHeight;
            }

            this.parentCell = {
                x: 0,
                y: 0,
                pixel: {
                    width: 0,
                    height: 0,
                    paddingLeft: 0,
                    paddingTop: 0,
                    paddingRight: 0,
                    paddingBottom: 0,
                }
            };
        },

        parseChild: function(child, parent, index) {
            var col = child.col = child.col || 0;
            var row = child.row = child.row || 0;
            child.colspan = child.colspan || 1;
            child.rowspan = child.rowspan || 1;
            child.width = child.width === null ? "100%" : child.width;
            child.height = child.height === null ? "100%" : child.height;

            var pixel = child.pixel;
            var w = this.pixel.cellWidth,
                h = this.pixel.cellHeight;

            var x = col * w;
            var y = row * h;

            this.parentCell.x = parent.x;
            this.parentCell.y = parent.y;
            this.parentCell.pixel.width = child.colspan * w;
            this.parentCell.pixel.height = child.rowspan * h;

            child.computeMargin(this.parentCell);

            this.parentCell.pixel.paddingLeft = this.pixel.cellSpaceH + pixel.marginLeft;
            this.parentCell.pixel.paddingTop = this.pixel.cellSpaceV + pixel.marginTop;

            child.computeRealMargin(this.parentCell);

            child.pixel.realMarginLeft += col * w;
            child.pixel.realMarginTop += row * h;

            child.computeWidth();
            child.computeHeight();
            child.computePositionX(this.parentCell);
            child.computePositionY(this.parentCell);
            child.computePadding();
            child.updateAABB();

        }

    }, BaseLayout);


    exports.TableLayout = TableLayout;

    if (typeof module != "undefined") {
        module.exports = TableLayout;
    }

}(CUI));
