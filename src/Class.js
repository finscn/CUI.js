"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = {
        SN: 0,
    };

    Class.create = function(constructor, proto, superclass) {

        if (typeof constructor === "object" && arguments.length < 3) {
            superclass = proto;
            proto = constructor;

            constructor = function(options) {
                this._initializeSuper();
                this.initialize();
                this.afterInitialize();

                for (var key in options) {
                    this[key] = options[key];
                }
                if (this.lazyInit === false) {
                    this.init();
                }
            };
            constructor.classSN = (++Class.SN);
        }

        var _proto = constructor.prototype;
        for (var p in proto) {
            _proto[p] = proto[p];
        }
        if (!_proto.initialize) {
            _proto.initialize = function() {};
        }
        if (!_proto.afterInitialize) {
            _proto.afterInitialize = function() {};
        }
        _proto._initializeSuper = function() {
            var $super = constructor.$super;
            if ($super) {
                $super._initializeSuper.call(this);
                $super.initialize.call(this);
                $super.afterInitialize.call(this);
            }
        };

        Class.extend(constructor, superclass);

        return constructor;
    };

    Class.extend = function(subclass, superclass) {
        var constructor = subclass;
        var proto = constructor.prototype;

        superclass = constructor.superclass = superclass || constructor.superclass || proto.superclass;

        var superProto;
        if (typeof superclass === "function") {
            superProto = superclass.prototype;
        } else {
            superProto = superclass;
        }

        for (var key in superProto) {
            if (!(key in proto) && key !== "constructor") {
                proto[key] = superProto[key];
            }
        }

        // === Call super-method ===
        // SubClass.$super.method.call(this,args);
        //  -- or --
        // SuperClass.prototype.method.call(this,args);

        constructor.$super = superProto;
        constructor.superclass = superclass;
        proto.superclass = superclass;
        if (!proto.constructor) {
            proto.constructor = constructor;
        }

        return subclass;
    };


    exports.Class = Class;

    if (typeof module != "undefined") {
        module.exports = Class;
    }

}(CUI));
