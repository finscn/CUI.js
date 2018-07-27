"use strict";

var CUI = CUI || {};

(function(exports) {

    var FontMapping = {

    };

    var Font = {
        getName: function(name, style) {
            var mname = FontMapping[style ? name + " " + style : name];
            if (mname) {
                name = mname;
            } else {
                // name = FontMapping["default"];
            }
            return name;
        },

        getStyle: function(size, name, weight) {
            size = size || 12;
            if (weight === "normal") {
                weight = null;
            }
            return (weight ? weight + " " : "") + size + "px " + name;
        }

    };

    exports.Font = Font;
    exports.FontMapping = FontMapping;

    if (typeof module !== "undefined") {
        module.exports = Font;
        module.exports = FontMapping;
    }

}(CUI));
