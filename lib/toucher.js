/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2018-10-26 11:15:33
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import EventEmitter from '@arted/utils/events';
import bind from '@arted/web/events';
import { throttle } from '@arted/animate';


/**
 *****************************************
 * 触控对象
 *****************************************
 */
export default class Toucher extends EventEmitter {

    /* 初始化对象 */
    constructor(el) {
        super();

        // 定义属性
        this.$el = el;
        this.$status = 'pending';
        this.$touches = null;
        this.$center = null;
        this.$$unbind = bind(el, createEvent(this), { passive: false });
    }

    /* 获取触控点 */
    get touches() {
        return this.$touches ? [...this.$touches.values()] : [];
    }

    /* 获取中心点 */
    get center() {

        // 生成缓存
        if (!this.$center) {
            let point = { x: 0, y: 0, sx: 0, sy: 0, dx: 0, dy: 0, dt: 0 },
                size = this.$touches.size;

            // 获取点位
            this.$touches.forEach(touch => {
                point.x += touch.x / size;
                point.y += touch.y / size;
                point.sx += touch.sx / size;
                point.sy += touch.sy / size;
                point.dx += touch.dx / size;
                point.dy += touch.dy / size;
                point.dt += touch.dt / size;
            });

            // 更新点位
            this.$center = point;
        }

        // 返回结果
        return this.$center;
    }

    /* 销毁对象 */
    destroy() {

        // 清空事件
        this.emit('destroy');
        this.off();

        // 清空数据
        this.$el = null;
        this.$status = null;
        this.$touches = null;
        this.$$unbind = this.$$unbind() && null;
    }
}


/**
 *****************************************
 * 绑定事件回调
 *****************************************
 */
function createEvent(toucher) {
    let onTouchStart = throttle(handleTouchStart.bind(toucher)),
        onTouchMove = throttle(handleTouchMove.bind(toucher)),
        onTouchEnd = throttle(handleTouchEnd.bind(toucher));

    // 返回事件
    return {
        touchstart: onTouchStart,
        touchmove: onTouchMove,
        touchcancel: onTouchEnd,
        touchend: onTouchEnd
    };
}


/**
 *****************************************
 * 监听触控开始
 *****************************************
 */
function handleTouchStart(event) {

    // 更新状态
    if (this.$status === 'pending') {

        // 更新触控点
        this.$center = null;
        this.$touches = createTouches(event);

        // 派发事件
        this.dispatch('touchStart', { touches: this.touches });

        // 更新状态
        this.$status = 'moving';
    }

    // 阻止默认事件
    event.preventDefault();
}


/**
 *****************************************
 * 监听触控移动
 *****************************************
 */
function handleTouchMove(event) {

    // 开始触控
    if (this.$status === 'pending') {
        return handleTouchStart.call(this, event);
    }

    // 更新触控点
    if (this.$status === 'moving') {

        // 更新触控点
        this.$center = null;
        this.$touches = createTouches(event, this.$touches);

        // 派发事件
        this.dispatch('touchMove', { touches: this.touches });
    }
}


/**
 *****************************************
 * 监听触控结束
 *****************************************
 */
function handleTouchEnd() {

    // 结束触控
    if (this.$status === 'moving') {

        // 派发事件
        this.dispatch('touchEnd', { touches: this.touches });

        // 更新状态
        this.$status = 'pending';
    }
}


/**
 *****************************************
 * 更新触控点
 *****************************************
 */
function createTouches(event, points) {
    let touches = event.touches || [],
        map = new Map();

    // 生成触控
    Array.prototype.forEach.call(touches, touch => {
        let t = event.timestamp || + new Date(),
            { identifier: id = 0, pageX: x = 0, pageY: y = 0 } = touch,
            { sx = x, sy = y, st = t, x: ox = x, y: oy = y, t: ot = t } = points ? points.get(id) : {};

        // 生成触控点
        map.set(id, {
            id,
            x, y, t,
            ox, oy, ot,
            sx, sy, st,
            dx: x - ox, dy: y - oy, dt: t - ot
        });
    });

    // 返回结果
    return map;
}
