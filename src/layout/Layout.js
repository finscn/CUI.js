var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var BaseLayout = exports.BaseLayout;
    var VBoxLayout = exports.VBoxLayout;
    var HBoxLayout = exports.HBoxLayout;
    var TableLayout = exports.TableLayout;

    var Layout = Class.create({
        constructor: Layout,

        init: function() {

        }

    });

    Layout.commonLayout = new BaseLayout();
    Layout.vBox = new VBoxLayout();
    Layout.hBox = new HBoxLayout();
    // Layout.tableBox = new TableLayout({
    //
    // });

    exports.Layout = Layout;

    if (typeof module != "undefined") {
        module.exports = Layout;
    }

}(CUI));
