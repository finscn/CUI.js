"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = {};

    Class.create = function(constructor, proto, superclass) {

        if (typeof constructor == "object" && arguments.length < 3) {
            superclass = proto;
            proto = constructor;
            constructor = function(options) {
                for (var key in options) {
                    this[key] = options[key];
                }
            };
        }

        var _proto = constructor.prototype;
        for (var p in proto) {
            _proto[p] = proto[p];
        }

        Class.extend(constructor, superclass);

        return constructor;
    };

    Class.extend = function(subclass, superclass) {
        var constructor = subclass;
        var proto = constructor.prototype;

        superclass = constructor.superclass = superclass || constructor.superclass || proto.superclass;

        var superProto;
        if (typeof superclass == "function") {
            superProto = superclass.prototype;
        } else {
            superProto = superclass;
        }

        for (var key in superProto) {
            if (!(key in proto)) {
                proto[key] = superProto[key];
            }
        }

        // === Call super-method ===
        // this.$super.method.call(this,args);
        //  -- or --
        // SubClass.$super.method.call(this,args);
        //  -- or --
        // SuperClass.prototype.method.call(this,args);

        constructor.$super = superProto;
        constructor.superclass = superclass;
        proto.$super = superProto;
        proto.superclass = superclass;
        proto.constructor = constructor;

        return subclass;
    };


    exports.Class = Class;

    if (typeof module != "undefined") {
        module.exports = Class;
    }

}(CUI));
