/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-26 15:08:43
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import { throttle } from '@arted/animate';
import { addEvent, removeEvent } from './event';


/**
 *****************************************
 * 绑定触控行为
 *****************************************
 */
export default class Toucher {

    /* 初始化对象 */
    constructor(el, emit) {

        // 定义属性
        this.$el = el;
        this.$emit = emit;
        this.touch = {};
        this.status = 'pending';

        // 绑定回调
        this.handleTouchStart = throttle(this.handleTouchStart.bind(this));
        this.handleTouchMove = throttle(this.handleTouchMove.bind(this));
        this.handleTouchEnd = throttle(this.handleTouchEnd.bind(this));

        // 绑定事件
        addEvent(el, 'touchstart', this.handleTouchStart, { passive: false });
        addEvent(el, 'touchmove', this.handleTouchMove, { passive: false });
        addEvent(el, 'touchcancel', this.handleTouchEnd, { passive: false });
        addEvent(el, 'touchend', this.handleTouchEnd, { passive: false });
    }

    /* 监听触控开始 */
    handleTouchStart(event) {
        if (this.$emit('touchStart', event)) {
            let { x, y, t } = createPoint(event),
                touch = { x, y, t };

            // 触发事件
            if (this.$emit('scroller.touchStart', touch)) {
                this.touch = { x, y, t, dx: 0, dy: 0, dt: 0 };
                this.status = 'moving';
            }

            // 阻止默认行为
            event.preventDefault();
        }
    }

    /* 监听触控移动 */
    handleTouchMove(event) {

        // 开始滚动
        if (this.status !== 'moving') {
            return this.handleTouchStart(event);
        }

        // 判断是否阻止默认行为
        if (this.$emit('touchMove', event)) {
            let { x, y, t } = createPoint(event),
                dx = x - this.touch.x,
                dy = y - this.touch.y,
                dt = t - this.touch.t;

            // 更新数据
            if (this.$emit('scroller.touchMove', { x, y, t, dx, dy, dt })) {
                this.touch = { x, y, t, dx, dy, dt };
            }

            // 阻止默认行为
            event.preventDefault();
        }
    }

    /* 监听触控结束 */
    handleTouchEnd(event) {
        if (this.$emit('touchEnd', event)) {
            if (this.$emit('scroller.touchEnd', this.touch)){
                this.status = 'pending';
            }
        }
    }


    /* 销毁对象 */
    destroy() {

        // 移除事件
        removeEvent(this.$el, 'touchstart', this.handleTouchStart, { passive: false });
        removeEvent(this.$el, 'touchmove', this.handleTouchMove, { passive: false });
        removeEvent(this.$el, 'touchcancel', this.handleTouchEnd, { passive: false });
        removeEvent(this.$el, 'touchend', this.handleTouchEnd, { passive: false });

        // 清空数据
        this.$el = null;
        this.$emit = null;
        this.touch = null;
        this.status = null;
    }
}


/**
 *****************************************
 * 创建坐标
 *****************************************
 */
function createPoint(event) {
    let point = event.touches ? event.touches[0] : event,
        x = point.pageX,
        y = point.pageY,
        t = event.timestamp || + new Date();

    // 返回点
    return { x, y, t };
}
