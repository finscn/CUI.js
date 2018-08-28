=======================================


v 添加 moveToX moveToY  moveBy moveTo
v 支持遮罩
v Picture 支持:  以缩放后的img大小为自己的实际大小
v 何时用 realOuterWidth ???
v 何时用 absolutWidth ???
v 优化 布局 和 reflow 的流程


优化/简化 scaleImg scaleBg 等属性

优化 设置text 和 更新文本 的流程

优化 computeSelf / computLayout , 以及何时调用

修复bug


=======================================
改变 组件大小 时
    马上改变
    if (父组件是 自适应组件){
        父组件.needToCompute=true
    }
    computePadding();

    sizeChanged = true
    needToCompute = true


改变 组件位置 时
    马上改变
    positionChanged = true
    needToCompute = true


改变 padding 时
    马上改变
    computePadding()
    needToCompute = true

改变 margin 时
    马上改变
    computeMargin()
    needToCompute = true


=======================================
updateChildren:

computeSelf:
        computeRealMargin();
        computeSize();
        computePosition();


update:
    computeSelf();
    updateChildren();
    layout.compute();


layout.compute:
    if (自适应组件){
        resizeParent
    }
    // do layout



=======================================
重构布局系统

自适应布局: 子组件大小变化时, 要重新布局
自适应组件: width/height==="auto"

宽高分开处理



>>>>>> 何时布局:
if (组件A大小变化) {
    _resized = true;
}

update() {
    updatePositon()
    updateSize();
    if (!自适应组件){
    }
    if (_resized){
        向上寻找, 找到离得最远(连续的)的 自适应组件, 将其标记为"需要重新布局"
        ????　在寻找的过程中, 更新找到的 自适应父组件 的大小 (利用增加量)
    }

    updateChildren();

    if (自适应组件){
        updateSize();
    }
}




if (组件A添加/删除了子组件 && 组件A是自适应组件) {
    向上寻找, 找到离得最远(连续的)的 自适应组件, 将其标记为"需要重新布局"
    ???? 在寻找的过程中, 更新找到的 自适应父组件 的大小 (利用增加量)
}

* 初始化后, 强制从根节点布局. 因为自适应组件的存在, 可能在未来若干帧内会多次布局.
* 大小变化: 既 改变width height margin, 对于自适应组件, padding变化也会引起大小变化.

>>>>>> 布局计算:
本质是计算子组件新的 baseX/baseY
布局是由 子组件大小变化引起的, 所以不需要重新子组件计算大小


relative: 'parent'
relative: 'root' moveTo absolut




