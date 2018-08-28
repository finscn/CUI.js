"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;

    var TableLayout = Class.create({
        superclass: BaseLayout,

        initialize: function() {
            this.flexible = false;

            this.cellWidth = null;
            this.cellHeight = null;

            this.cellSpaceH = null;
            this.cellSpaceV = null;

            this.cols = 1;
            this.rows = 1;
        },

        init: function() {
            var pixel = this.pixel;
            var tableWidth = (this.cellWidth + this.cellSpace) * this.cols + this.cellSpace;
            var tableHeight = (this.cellHeight + this.cellSpace) * this.rows + this.cellSpace;
            // tableWidth += pixel.cellSpaceH;
            // tableHeight += pixel.cellSpaceV;

            pixel.tableWidth = tableWidth;
            pixel.tableHeight = tableHeight;
            pixel.cellSpace = Utils.parseValue(this.cellSpace, tableWidth) || 0;
            pixel.cellSpaceH = Utils.parseValue(this.cellSpaceH, tableWidth);
            pixel.cellSpaceV = Utils.parseValue(this.cellSpaceV, tableHeight);

            if (pixel.cellSpaceH === null) {
                pixel.cellSpaceH = pixel.cellSpace;
            }
            if (pixel.cellSpaceV === null) {
                pixel.cellSpaceV = pixel.cellSpace;
            }

            var cellInnerWidth = (tableWidth + pixel.cellSpaceH) / (this.cols || 1) - pixel.cellSpaceH >> 0;
            var cellInnerHeight = (tableHeight + pixel.cellSpaceV) / (this.rows || 1) - pixel.cellSpaceV >> 0;
            pixel.cellInnerWidth = cellInnerWidth;
            pixel.cellInnerHeight = cellInnerHeight;

            if (!this.cellWidth) {
                pixel.cellWidth = cellInnerWidth;
            } else {
                pixel.cellWidth = Utils.parseValue(this.cellWidth, cellInnerWidth) || cellInnerWidth;
            }
            if (!this.cols) {
                this.cols = (tableWidth + pixel.cellSpaceH) / pixel.cellWidth >> 0;
            }

            if (!this.cellHeight) {
                pixel.cellHeight = cellInnerHeight;
            } else {
                pixel.cellHeight = Utils.parseValue(this.cellHeight, cellInnerHeight) || cellInnerHeight;
            }
            if (!this.rows) {
                this.rows = (tableHeight + pixel.cellSpaceV) / pixel.cellHeight >> 0;
            }
        },

        compute: function(parent) {
            console.log('TableLayout.compute');
            var children = parent.children;
            var childCount = children.length;
            var idx = 0;

            if (childCount === 0) {
                return idx;
            }

            this.initParentCell();

            for (var i = 0; i < childCount; i++) {
                var child = children[i];
                if (child.relative === "parent") {
                    // child.computeSelf(parent);
                } else {
                    this.parseChild(child, parent, idx);
                    idx++;
                }
            }

            if (childCount > 0) {
                this.tryToResizeParent(parent, parent._absoluteWidth, parent._absoluteHeight);
            }
            return idx;
        },

        initParentCell: function() {

            this.parentCell = {
                _absoluteX: 0,
                _absoluteY: 0,
                _absoluteWidth: 0,
                _absoluteHeight: 0,
                _offsetX: 0,
                _offsetY: 0,
                scrollX: 0,
                scrollY: 0,
                pixel: {
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
                }
            };
        },

        parseChild: function(child, parent, index) {
            var col = child.col = child.col || 0;
            var row = child.row = child.row || 0;
            child.colspan = child.colspan || 1;
            child.rowspan = child.rowspan || 1;
            // child.width = child.width === null ? "100%" : child.width;
            // child.height = child.height === null ? "100%" : child.height;

            var pixel = child.pixel;

            // no cellSpace
            var w = this.pixel.cellWidth,
                h = this.pixel.cellHeight;

            var cellSpaceH = this.pixel.cellSpaceH;
            var cellSpaceV = this.pixel.cellSpaceV;

            var parentCell = this.parentCell;

            parentCell.pixel.x = parent.absoluteX;
            parentCell.pixel.y = parent.absoluteY;

            parentCell._absoluteX = parentCell.pixel.x;
            parentCell.absoluteX = parentCell._absoluteX;

            parentCell._absoluteY = parentCell.pixel.y;
            parentCell.absoluteY = parentCell._absoluteY;

            parentCell.pixel.width = child.colspan * (w + cellSpaceH) - cellSpaceH;
            parentCell.pixel.height = child.rowspan * (h + cellSpaceV) - cellSpaceV;

            parentCell._absoluteWidth = parentCell.pixel.width;
            parentCell.absoluteWidth = parentCell._absoluteWidth;

            parentCell._absoluteHeight = parentCell.pixel.height;
            parentCell.absoluteHeight = parentCell._absoluteHeight;

            child.computeMargin(parentCell);
            child.computeWidth();
            child.computeHeight();

            child._movedX = true;
            child.pixel.baseX = Math.max(child.marginLeft, parent.paddingLeft) + col * (w + cellSpaceH);

            child._movedY = true;
            child.pixel.baseY = Math.max(child.marginTop, parent.paddingTop) + row * (h + cellSpaceV);

            child.syncPosition(parentCell);
        },
    });


    exports.TableLayout = TableLayout;

    if (typeof module !== "undefined") {
        module.exports = TableLayout;
    }

}(CUI));
