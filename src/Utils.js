var CUI = CUI || {};

(function(exports) {

    var Utils = {

        parseValue: function(value, relativeValue) {
            if (typeof value == "number" || value === true || value === false || value === null || value === undefined) {
                return value;
            }
            if (typeof value == "string" && value.lastIndexOf("%") > 0) {
                value = (parseFloat(value) / 100) * (relativeValue || 0);
                return value;
            }
            return parseFloat(value);
        },
    };

    exports.Utils = Utils;

    if (typeof module != "undefined") {
        module.exports = Utils;
    }

}(CUI));
