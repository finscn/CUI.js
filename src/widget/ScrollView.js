"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    var Slider = exports.Slider;

    var ScrollView = Class.create({

        scrollH: false,
        scrollV: true,

        scrollX: 0,
        scrollY: 0,
        scrollDX: 0,
        scrollDY: 0,

        damping: null,
        outEdge: 60,

        thumbWidth: 10,
        thumbColor: "rgba(255,255,255,0.6)",
        thumbBgColor: "rgba(0,0,0,0.4)",

        init: function() {

            ScrollView.$super.init.call(this);

            this.slider = new Slider({});
            if (this.damping) {
                this.slider.damping = this.damping;
            }
            this.scrollWidthOrigin = this.scrollWidth;
            this.scrollHeightOrigin = this.scrollHeight;
            this.resetScrollInfo();
        },

        resetScrollInfo: function() {
            this.slider.reset();
            this.scrollX = this.scrollDX = 0;
            this.scrollY = this.scrollDY = 0;
            this.lastScrollX = this.lastScrollY = 0;
            this.visibleChildren = [];

            var firstChild = this.children[0];
            if (firstChild) {
                var lastChild = this.children[this.children.length - 1];
                var innerLeft = this.paddingLeft - this.x;
                var innerTop = this.paddingTop - this.y;
                var innerWdith = innerLeft + lastChild.x + lastChild.w + this.paddingRight;
                var innerHeight = innerTop + lastChild.y + lastChild.h + this.paddingBottom;
                this.scrollWidth = this.scrollWidthOrigin || innerWdith;
                this.scrollHeight = this.scrollHeightOrigin || innerHeight;
            } else {
                this.scrollWidth = this.scrollWidthOrigin || 0;
                this.scrollHeight = this.scrollHeightOrigin || 0;
            }

            this.minScrollX = this.minScrollY = 0;
            this.maxScrollX = Math.max(0, this.scrollWidth - this.w);
            this.maxScrollY = Math.max(0, this.scrollHeight - this.h);

            this.rateWidth = this.w / this.scrollWidth;
            this.rateHeight = this.h / this.scrollHeight;

            this.thumbHSize = this.w * this.rateWidth >> 0;
            this.thumbVSize = this.h * this.rateHeight >> 0;

            this.thumbX = this.scrollX * this.rateWidth >> 0;
            this.thumbY = this.scrollY * this.rateHeight >> 0;
        },

        reset: function() {
            var Me = this;
            this.children.forEach(function(c) {
                c.moveBy(Me.scrollX, Me.scrollY);
            });
            this.resetScrollInfo();
        },


        startScroll: function(vx, vy) {
            if (!this.scrollH) {
                vx = 0;
            }
            if (!this.scrollV) {
                vy = 0;
            }
            this.scorllOver = false;

            this.slider.toStart = true;
            this.slider.start(vx, vy);

        },

        stopScroll: function() {
            this.slider.stop();
            this.stopTween();
        },

        scrollBy: function(dx, dy) {
            if (this.scrollH) {
                this.setScrollX(this.scrollX - dx);
            }
            if (this.scrollV) {
                this.setScrollY(this.scrollY - dy);
            }
        },
        setScrollX: function(scrollX) {
            this.scrollX = Math.max(this.minScrollX - this.outEdge, Math.min(this.maxScrollX + this.outEdge, scrollX));
            this.thumbX = this.scrollX * this.rateWidth >> 0;
        },
        setScrollY: function(scrollY) {
            this.scrollY = Math.max(this.minScrollY - this.outEdge, Math.min(this.maxScrollY + this.outEdge, scrollY));
            this.thumbY = this.scrollY * this.rateHeight >> 0;
        },
        canScroll: function() {
            var canX = this.scrollH;
            if (this.scrollX <= this.minScrollX - this.outEdge / 2 || this.scrollX >= this.maxScrollX + this.outEdge / 2) {
                canX = false
            }
            if (canX) {
                return true;
            }
            var canY = this.scrollV;
            if (this.scrollY <= this.minScrollY - this.outEdge / 2 || this.scrollY >= this.maxScrollY + this.outEdge / 2) {
                canY = false
            }
            return canY;
        },

        startTween: function() {
            if (this.scrollX < this.minScrollX || this.scrollX > this.maxScrollX || this.scrollY < this.minScrollY || this.scrollY > this.maxScrollY) {
                var Me = this;
                this.stopTween();
                var _tx = Math.min(this.maxScrollX, Math.max(this.minScrollX, this.scrollX));
                var _ty = Math.min(this.maxScrollY, Math.max(this.minScrollY, this.scrollY));
                var _cx = this.scrollX;
                var _cy = this.scrollY;
                var _dx = _tx - _cx;
                var _dy = _ty - _cy;

                this.tween = {
                    duration: 300,
                    played: 0,
                    onUpdate: function(k) {
                        var dx = Me.scrollX - _cx - _dx * k;
                        var dy = Me.scrollY - _cy - _dy * k;
                        if (dx || dy) {
                            Me.scrollBy(dx, dy);
                        }
                    },
                    onComplete: function() {
                        Me.thumbX = Me.scrollX * Me.rateWidth >> 0;
                        Me.thumbY = Me.scrollY * Me.rateHeight >> 0;
                        Me.scorllOver = true;
                        Me.stopScroll();
                    },
                };
            }
        },

        stopTween: function() {
            this.tween = null;
        },

        updateTween: function(timeStep) {
            var tween = this.tween;
            if (!tween) {
                return false;
            }
            tween.played += timeStep;
            if (tween.played < 0) {
                return false;
            }
            var k = tween.played / tween.duration;
            if (k >= 1) {
                k = 1;
                tween.onComplete();
                this.stopTween();
            } else {
                tween.onUpdate(k);
            }
            return true;

        },

        onTouchStart: function(x, y, id) {
            if (this.isInRegion(x, y)) {
                this.stopScroll();
            }
            return false;
        },

        onTouchEnd: function(x, y, id) {
            this.startTween();
            return false;
        },

        onPan: function(x, y, dx, dy, startX, startY, id) {
            if (this.isInRegion(startX, startY)) {
                this.scrollBy(dx, dy);
                return;
            }
            return false;
        },

        onSwipe: function(x, y, vx, vy, startX, startY, id) {
            if (this.isInRegion(startX, startY)) {
                this.startScroll(vx, vy);
                return;
            }
            return false;
        },

        computeLayout: function(forceCompute) {
            if (this.composite && (this.needToCompute || forceCompute)) {
                this.needToCompute = false;
                this.layout.compute(this);
                this.reset();
            }
        },

        updateSelf: function(timeStep, now) {

            this.updateTween(timeStep);

            if (this.scorllOver) {
                return;
            }
            var scrolling = this.slider.update(timeStep);
            if (scrolling) {
                this.scrollBy(this.slider.dx, this.slider.dy);
            }
            if (!scrolling || !this.canScroll()) {
                this.scorllOver = true;
                this.startTween();
            }

        },

        renderScrollbar: function(context, timeStep, now) {
            if (!this.thumbWidth) {
                return;
            }
            if (this.scrollH && this.rateWidth < 1) {
                var y = this.y + this.h - this.thumbWidth;
                context.fillStyle = this.thumbBgColor;
                context.fillRect(this.x + 0, y, this.w, this.thumbWidth);
                context.fillStyle = this.thumbColor;
                context.fillRect(this.x + this.thumbX + 1, y + 1, this.thumbHSize - 2, this.thumbWidth - 2);
            } else if (this.scrollV && this.rateHeight < 1) {
                var x = this.x + this.w - this.thumbWidth;
                context.fillStyle = this.thumbBgColor;
                context.fillRect(x, this.y + 0, this.thumbWidth, this.h);
                context.fillStyle = this.thumbColor;
                context.fillRect(x + 1, this.y + this.thumbY + 1, this.thumbWidth - 2, this.thumbVSize - 2);
            }
        },

        renderChildren: function(context, timeStep, now) {

            this.scrollDX = this.scrollX - this.lastScrollX;
            this.scrollDY = this.scrollY - this.lastScrollY;

            context.save();
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.w, this.y);
            context.lineTo(this.x + this.w, this.y + this.h);
            context.lineTo(this.x, this.y + this.h);
            context.closePath();
            context.clip();
            context.fillStyle = "green";
            var y = this.y - this.scrollY + 20;
            for (var i = 0; i < 30; i++) {
                context.fillRect(0, y, this.w, 150);
                y += 170;
            }
            // this.renderScrollbar(context, timeStep, now);
            // context.translate(-this.scrollX, -this.scrollY);
            var Me = this;
            // var aabb = this.aabb;
            this.visibleChildren.length = 0;
            var vc = this.visibleChildren;
            var scrollChanged = !!(this.scrollDX || this.scrollDY);
            this.children.forEach(function(c) {
                if (scrollChanged) {
                    c.moveBy(-Me.scrollDX, -Me.scrollDY);
                }
                if (Me.checkCollideAABB(c.aabb)) {
                    c.render(context, timeStep, now);
                    vc.push(c);
                }
            });

            this.renderScrollbar(context, timeStep, now);

            context.restore();

            this.scrollDX = 0;
            this.scrollDY = 0;
            this.lastScrollX = this.scrollX,
            this.lastScrollY = this.scrollY;

        },

    }, Component);


    exports.ScrollView = ScrollView;

    if (typeof module != "undefined") {
        module.exports = ScrollView;
    }

}(CUI));
