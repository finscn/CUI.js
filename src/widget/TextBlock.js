// TODO

"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Label = exports.Label;

    var TextBlock = Class.create({
        superclass: Label,
    });

    exports.TextBlock = TextBlock;

    if (typeof module !== "undefined") {
        module.exports = TextBlock;
    }

}(CUI));
