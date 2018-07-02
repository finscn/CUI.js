"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Component = exports.Component;
    // var Panel = exports.Panel;
    var Slider = exports.Slider;

    var noop = exports.noop;


    var ScrollView = Class.create({
        superclass: Component,

        initialize: function() {
            // this.computeWidth = Panel.prototype.computeWidth;
            // this.computeHeight = Panel.prototype.computeHeight;

            this.scrollH = false;
            this.scrollV = true;

            this.scrollX = 0;
            this.scrollY = 0;
            this.scrollDX = 0;
            this.scrollDY = 0;

            this.clip = true;

            this.outEdge = 90;
            this.damping = 0.0025;
            this.swipeScale = 1.2;
            this.minScrollVel = 0.12;
            this.bounceDuration = 180;
            this.scrollingDuration = 700;

            this.scrollThumb = true;
            this.thumbWidth = 10;
            this.thumbColor = "rgba(255,255,255,0.6)";
            this.thumbBgColor = "rgba(0,0,0,0.4)";

            // TODO
            this.snapWidth = null;
            this.snapHeight = null;
        },

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            ScrollView.$super.init.call(this);

            this.visibleChildren = [];

            this.slider = new Slider({});
            if (this.damping) {
                this.slider.damping = this.damping;
            }
            this.scrollWidthOrigin = this.scrollWidth;
            this.scrollHeightOrigin = this.scrollHeight;

            this.initChildren();

            this.resetScrollInfo();

            if (this.afterInit) {
                this.afterInit();
            }
        },

        resetScrollInfo: function() {
            this.slider.reset();
            this.scrolling = 0;
            this.scrollX = this.scrollDX = 0;
            this.scrollY = this.scrollDY = 0;
            this.lastScrollX = this.lastScrollY = 0;
            this.visibleChildren.length = 0;

            var firstChild = this.children[0];
            if (firstChild) {
                var lastChild = this.children[this.children.length - 1];

                var innerWdith = lastChild.x + lastChild.w + lastChild.marginRight - firstChild.x + firstChild.marginLeft;
                innerWdith += this.paddingLeft + this.paddingRight;
                var innerHeight = lastChild.y + lastChild.h + lastChild.marginBottom - firstChild.y + firstChild.marginTop;
                innerHeight += this.paddingTop + this.paddingBottom;

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

            this.thumbHSize = (this.w - this.paddingLeft - this.paddingRight) * this.rateWidth >> 0;
            this.thumbVSize = (this.h - this.paddingTop - this.paddingBottom) * this.rateHeight >> 0;

            this.thumbX = this.scrollX * this.rateWidth >> 0;
            this.thumbY = this.scrollY * this.rateHeight >> 0;

            this.stopTween();
        },

        reset: function() {
            var Me = this;
            this.children.forEach(function(c) {
                c.moveBy(Me.scrollX, Me.scrollY);
            });
            this.resetScrollInfo();
            this.onReset();
        },
        onReset: noop,

        startScroll: function(vx, vy) {
            if (!this.scrollH) {
                vx = 0;
            }
            if (!this.scrollV) {
                vy = 0;
            }
            if (Math.abs(vx) < this.minScrollVel && Math.abs(vy) < this.minScrollVel) {
                return;
            }
            this.scorllOver = false;
            this.slider.toStart = true;
            this.slider.start(vx, vy);
        },

        stopScroll: function() {
            this.slider.stop();
            this.stopTween();
        },

        focusOnChild: function(child, paddingX, paddingY) {
            paddingX = paddingX || this.paddingLeft;
            paddingY = paddingY || this.paddingTop;

            var aabb = child.aabb
            var aabb2 = this.aabb;
            var outLeft = (aabb[0] - paddingX) - aabb2[0];
            var outRight = (aabb[2] + paddingX) - aabb2[2];
            var outTop = (aabb[1] - paddingY) - aabb2[1];
            var outBottom = (aabb[3] + paddingY) - aabb2[3];

            var dx = 0,
                dy = 0;
            if (outLeft < 0) {
                dx = outLeft;
            } else if (outRight > 0) {
                dx = outRight;
            }

            if (outTop < 0) {
                dy = outTop;
            } else if (outBottom > 0) {
                dy = outBottom;
            }

            if (dx || dy) {
                this.scrollBy(dx, dy);
                return [dx, dy];
            }
            return false;
        },

        scrollTo: function(x, y) {
            this.stopTween();
            if (this.scrollH) {
                this.setScrollX(x);
            }
            if (this.scrollV) {
                this.setScrollY(y);
            }
        },

        scrollBy: function(dx, dy) {
            this.scrolling = this.scrollingDuration;
            if (this.scrollH) {
                if (this.scrollX < this.minScrollX && dx < 0 || this.scrollX > this.maxScrollX && dx > 0) {
                    dx = dx * 0.3;
                }
                this.setScrollX(this.scrollX + dx);
            }
            if (this.scrollV) {
                if (this.scrollY < this.minScrollY && dy < 0 || this.scrollY > this.maxScrollY && dy > 0) {
                    dy = dy * 0.3;
                }
                this.setScrollY(this.scrollY + dy);
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

        startTween: function(target, duration) {

            target = target || {
                x: this.scrollX,
                y: this.scrollY,
            }

            if (this.scrollH && this.snapWidth) {
                target.x = Math.round(target.x / this.snapWidth) * this.snapWidth;
            }
            if (this.scrollV && this.snapHeight) {
                target.y = Math.round(target.y / this.snapHeight) * this.snapHeight;
            }
            target.x = Math.min(this.maxScrollX, Math.max(this.minScrollX, target.x));
            target.y = Math.min(this.maxScrollY, Math.max(this.minScrollY, target.y));

            this.stopTween();

            var Me = this;
            var _cx = this.scrollX;
            var _cy = this.scrollY;
            var _dx = target.x - _cx;
            var _dy = target.y - _cy;

            if (_dx || _dy) {
                this.tween = {
                    duration: (duration === 0 || duration) ? duration : this.bounceDuration,
                    played: 0,
                    target: target,
                    onUpdate: function(k) {
                        var dx = _cx + _dx * k - Me.scrollX;
                        var dy = _cy + _dy * k - Me.scrollY;
                        if (dx || dy) {
                            Me.scrollBy(dx, dy);
                        }
                    },
                    onComplete: function() {
                        Me.scrollX = this.target.x;
                        Me.scrollY = this.target.y;
                        Me.thumbX = Me.scrollX * Me.rateWidth >> 0;
                        Me.thumbY = Me.scrollY * Me.rateHeight >> 0;
                        Me.scorllOver = true;
                        Me.stopScroll();
                        Me.afterTween(Me.scrollX, Me.scrollY);
                    },
                }
            }
        },

        stopTween: function() {
            this.tween = null;
        },

        afterTween: function(x, y) {
            // do nothing.
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
            if (this.containPoint(x, y)) {
                this.stopScroll();
            }
            return false;
        },

        onTouchEnd: function(x, y, id) {
            this.startTween();
            return false;
        },

        onPan: function(x, y, dx, dy, startX, startY, id) {
            // if (this.containPoint(startX, startY)) {
            if (this.scrollV && this.scrollH && this.containPoint(x, y)) {
                this.scrollBy(-dx, -dy);
                return;
            }
            if (this.scrollV && this.containPoint(x, startY) ||
                this.scrollH && this.containPoint(startX, y)) {
                this.scrollBy(-dx, -dy);
                return;
            }
            return false;
        },

        onSwipe: function(x, y, vx, vy, startX, startY, id) {
            if (this.containPoint(startX, startY)) {
                vx = vx * this.swipeScale;
                vy = vy * this.swipeScale;
                this.startScroll(-vx, -vy);
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

        updateChildren: function(timeStep, now) {
            // this.children.forEach(function(child) {
            //     child.update(timeStep, now);
            // });

            var Me = this;
            this.scrollDX = this.scrollX - this.lastScrollX;
            this.scrollDY = this.scrollY - this.lastScrollY;

            var vc = this.visibleChildren;
            var scrollChanged = this.scrollDX || this.scrollDY || vc.length === 0;
            if (scrollChanged) {
                // console.log("scrolling : ", this.id, this.scrollDX, this.scrollDY, vc.length);
                vc.length = 0;
            }

            this.children.forEach(function(child, idx) {
                if (scrollChanged) {
                    child.moveBy(-Me.scrollDX, -Me.scrollDY);
                    if (Me.checkCollideAABB(child.aabb)) {
                        vc.push(child);
                    }
                }
                child.update(timeStep, now);
            });

            this.scrollDX = 0;
            this.scrollDY = 0;
            this.lastScrollX = this.scrollX;
            this.lastScrollY = this.scrollY;
        },

        renderScrollbar: function(renderer, timeStep, now) {
            if (!this.thumbWidth) {
                return;
            }
            if (this.scrollThumb && this.scrolling <= 0) {
                return;
            }
            this.scrolling -= timeStep;

            if (this.scrollH && this.rateWidth < 1) {
                var y = this.y + this.h - this.thumbWidth;
                renderer.fillRect(this.x + this.paddingLeft + 0, y, this.w, this.thumbWidth, this.thumbBgColor);
                renderer.fillRect(this.x + this.paddingLeft + this.thumbX + 1, y + 1, this.thumbHSize - 2, this.thumbWidth - 2, this.thumbColor);
            }
            if (this.scrollV && this.rateHeight < 1) {
                var x = this.x + this.w - this.thumbWidth;
                renderer.fillRect(x, this.y + this.paddingTop + 0, this.thumbWidth, this.h, this.thumbBgColor);
                renderer.fillRect(x + 1, this.y + this.paddingTop + this.thumbY + 1, this.thumbWidth - 2, this.thumbVSize - 2, this.thumbColor);
            }
        },

        startClip: function(renderer) {
            var root = this.root;
            var ox = root.originalX || 0;
            var oy = root.originalY || 0;
            renderer.clipRect(this.x + ox, this.y + oy, this.w, this.h);

        },
        endClip: function(renderer) {
            renderer.unclipRect();
        },

        renderChildren: function(renderer, timeStep, now) {

            if (this.clip) {
                this.startClip(renderer);
            }

            this.visibleChildren.forEach(function(c) {
                c.render(renderer, timeStep, now);
            });

            this.renderScrollbar(renderer, timeStep, now);

            if (this.clip) {
                this.endClip(renderer);
            }

        },

        getTouchableChildren: function() {
            // return this.children;
            return this.visibleChildren;
        },

    });


    exports.ScrollView = ScrollView;

    if (typeof module !== "undefined") {
        module.exports = ScrollView;
    }

}(CUI));
