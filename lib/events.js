/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-25 10:27:45
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import animate from '@arted/animate';


/**
 *****************************************
 * 定义模型
 *****************************************
 */
let model = {};


/**
 *****************************************
 * 处理滚动开始事件
 *****************************************
 */
export function onScrollStart(event) {
    if (!emitEvent.call(this, 'touchStart', event)) {
        let { x, y, t } = createPoint(event);

        // 更新数据
        model = { x, y, t, dx: 0, dy: 0, dt: 0 };

        // 中上动画
        this.$$anim && this.$$anim.stop();

        // 触发事件
        this.emit('scrollStart');

        // 更新状态
        this.status = 'scroll';

        // 阻止默认行为
        event.preventDefault();
    }
}


/**
 *****************************************
 * 处理滚动事件
 *****************************************
 */
export function onScroll(event) {

    // 开始滚动
    if (this.status !== 'scroll') {
        return onScrollStart.call(this, event);
    }

    // 判断是否阻止默认行为
    if (!emitEvent.call(this, 'touchMove', event)) {
        let { x, y, t } = createPoint(event),
            dx = this.scrollX ? x - model.x : 0,
            dy = this.scrollY ? y - model.y : 0,
            dt = t - model.t;

        // 更新位置
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {

            // 更新位置
            this.translateBy(dx, dy);

            // 更新数据
            model = { x, y, t, dx, dy, dt };
        }

        // 阻止默认行为
        event.preventDefault();
    }
}


/**
 *****************************************
 * 处理滚动结束事件
 *****************************************
 */
export function onScrollEnd(event) {
    if (!emitEvent.call(this, 'touchEnd', event)) {

        // 执行惯性动画
        if (this.momentum) {
            let { dx, dy, dt } = model;

            if (Math.abs(dx / dt) > .1 || Math.abs(dy / dt) > .1) {

                // 更新状态
                this.status = 'animating';

                // 生成动画
                this.$$anim && this.$$anim.stop();
                this.$$anim = animate(() => {

                    // 更新偏移量
                    dx *= this.momentum;
                    dy *= this.momentum;

                    // 更新位置
                    if (this.translateBy(dx, dy) === false) {
                        if (this.reset(true) === false) {
                            this.status = 'pending';
                            this.emit('scrollEnd');
                        }

                        return false;
                    }
                });
            }
        }

        // 结束滚动
        if (this.reset(true) === false) {
            this.status = 'pending';
            this.emit('scrollEnd');
        }
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


/**
 *****************************************
 * 创建事件
 *****************************************
 */
function createEvent(data, isDefaultPrevented = false) {
    return Object.create(data, {
        preventDefault() {
            isDefaultPrevented = true;
        },
        defaultPrevented: {
            get() {
                return isDefaultPrevented;
            }
        }
    });
}


/**
 *****************************************
 * 执行事件
 *****************************************
 */
export function emitEvent(type, data) {
    let event = createEvent(data);

    // 执行事件
    this.emit(type, event);
    return event.defaultPrevented;
}


/**
 *****************************************
 * 衰减偏移
 *****************************************
 */
export function thwarted(dx, dy) {
    let x = this.x + dx,
        y = this.y + dy,
        r = this.status === 'animating' ? .5 : .15;

    // 【x】溢出衰减
    if (x < this.minX) {
        if (dx < 0) {
            dx = this.bounce ? Math.min(0, dx + (this.minX - x) * r) : this.minX - this.x;
        }
    } else if (x > this.maxX) {
        if (dx > 0) {
            dx = this.bounce ? Math.max(0, dx + (this.maxX - x) * r) : this.maxX - this.x;
        }
    }

    // 【y】溢出衰减
    if (y < this.minY) {
        if (dy < 0) {
            dy = this.bounce ? Math.min(0, dy + (this.minY - y) * r) : this.minY - this.y;
        }
    } else if (y > this.maxY) {
        if (dy > 0) {
            dy = this.bounce ? Math.max(0, dy + (this.maxY - y) * r) : this.maxY - this.y;
        }
    }

    console.log(dx, dy, this.y, this.maxY);

    // 返回结果
    return { dx, dy };
}
