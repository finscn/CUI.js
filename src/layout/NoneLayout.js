"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;

    var NoneLayout = Class.create({

        initialize: function() {
            this.flexible = false;
        },

        init: function() {

        },

        compute: function(parent) {

        },

        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////

    });


    exports.NoneLayout = NoneLayout;

    if (typeof module !== "undefined") {
        module.exports = NoneLayout;
    }

}(CUI));
