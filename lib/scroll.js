/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-15 13:56:53
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import EventEmitter from '@arted/utils/events';
import throttle from '@arted/animate/throttle';
import animtate from '@arted/animate';
import { createTarget, createEvent, translate } from './utils';



/**
 *****************************************
 * 创建滚动
 *****************************************
 */
export default class Scroll extends EventEmitter {

    /* 初始化对象 */
    constructor(el, options) {
        super();

        // 获取元素
        this.$$el = el;
        this.$$target = createTarget(el);
        this.$$scroller = el.firstElementChild || el.firstChild;
        this.$$style = this.$$scroller.style;
        this.$$anim = null;

        // 定义属性
        this.x = 0;
        this.y = 0;
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;

        // 定义状态
        this.$$state = { x: 0, y: 0, status: 'pending' };

        // 定义配置
        this.$$options = {
            startX: 0,
            startY: 0,
            scrollX: false,
            scrollY: true,
            momentum: .98,
            bounce: 150
        };

        // 绑定回调
        this.handleStart = throttle(this.handleStart.bind(this));
        this.handleMove = throttle(this.handleMove.bind(this));
        this.handleEnd = throttle(this.handleEnd.bind(this));

        // 初始化
        this.bindEvent();
        this.refresh(options);
    }

    /* 绑定事件 */
    bindEvent() {
        this.$$target.addEvent('touchstart', this.handleStart, { passive: false });
        this.$$target.addEvent('touchmove', this.handleMove, { passive: false });
        this.$$target.addEvent('touchcancel', this.handleEnd, { passive: false });
        this.$$target.addEvent('touchend', this.handleEnd, { passive: false });
        this.$$target.addEvent('mousedown', this.handleStart, { passive: false });
        this.$$target.addEvent('mousemove', this.handleMove, { passive: false });
        this.$$target.addEvent('mousecancel', this.handleEnd, { passive: false });
        this.$$target.addEvent('mouseup', this.handleEnd, { passive: false });
    }

    /* 更新配置 */
    setOptions({ startX, startY, bounce, momentum, ...options }) {

        // 合并配置
        this.$$options = { ...this.$$options, ...options };

        // 更新【x】位置
        if (typeof startX === 'number') {
            this.x = this.$$options.startX = startX;
        }

        // 更新【y】位置
        if (typeof startY === 'number') {
            this.y = this.$$options.startY = startY;
        }

        // 更新【bounce】
        if (typeof bounce !== 'number') {
            this.$$options.bounce = bounce === false ? 0 : 150;
        }

        // 更新【momentum】
        if (typeof momentum !== 'number') {
            this.$$options.momentum = momentum === false ? 0 : .98;
        }
    }

    /* 刷新列表 */
    refresh(options) {

        // 更新配置
        options && this.setOptions(options);

        // 更新滚动范围
        this.minX = Math.min(0, this.$$el.clientWidth - this.$$scroller.clientWidth);
        this.minY = Math.min(0, this.$$el.clientHeight - this.$$scroller.clientHeight);

        // 重置位置
        this.reset();
    }

    /* 重置位置 */
    reset(duration) {
        let x = Math.max(this.minX, Math.min(this.maxX, this.x)),
            y = Math.max(this.minY, Math.min(this.maxY, this.y));

        // 判断是否需要更新
        if (x === this.x && y === this.y) {
            return false;
        }

        // 执行滚动
        this.scrollTo(x, y, duration);
    }

    /* 手势开始 */
    handleStart(event) {
        let point = event.touches ? event.touches[0] : event;

        // 更新状态
        this.$$state.x = point.pageX;
        this.$$state.y = point.pageY;
        this.$$state.t = + new Date();
        this.$$state.status = 'moving';

        // 阻止动画
        this.$$anim && this.$$anim.stop();

        // 执行事件回调
        this.emit('touchStart', event);

        // 阻止默认行为
        event.preventDefault();
    }

    /* 手势移动 */
    handleMove(event) {
        console.log('--> move');

        // 处理滚动
        if (this.$$state.status === 'moving') {
            let point = event.touches ? event.touches[0] : event,
                x = point.pageX,
                y = point.pageY,
                t = + new Date(),
                dx = this.$$options.scrollX ? x - this.$$state.x : 0,
                dy = this.$$options.scrollY ? y - this.$$state.y : 0,
                dt = t - this.$$state.t;


            // 判断是否需要更新
            if (dy || dx) {

                // 更新位置
                this.translateBy(dx, dy);

                // 更新状态
                this.$$state.x = x;
                this.$$state.y = y;
                this.$$state.t = t;
                this.$$state.dx = dx;
                this.$$state.dy = dy;
                this.$$state.dt = dt;
            }

            // 阻止默认行为
            return event.preventDefault();
        }

        // 重置开始状态
        this.handleStart(event);
    }

    /* 手势结束 */
    handleEnd(event) {

        // 执行事件回调
        this.emit('touchEnd', event);

        // 处理结果
        if (!event.defaultPrevented) {
            if (this.$$options.momentum && this.$$state.dt) {
                let { dx, dy } = this.$$state,
                    d = .98;

                // 执行动画
                this.$$anim && this.$$anim.stop();
                return this.$$anim = animtate(e => {
                    dx *= d;
                    dy *= d;

                    // 结束动画
                    if (this.translateBy(dx, dy) === false) {

                        // 重置位置
                        if (this.reset(150) === false) {
                            this.$$state.status = 'pending';
                            this.emit('scrollEnd');
                        }

                        // 阻止下一帧
                        e.preventDefault();
                        return false;
                    }
                });
            }
        }

        // 更新状态
        this.$$state.status = 'pending';

        // 执行事件回调
        this.emit('scrollEnd');
    }

    /* 指定偏移距离 */
    translateBy(dx, dy) {
        let event = createEvent(),
            overflow = 150;

        // 【x】溢出衰减
        if (this.x < this.minX) {
            if (dx < 0) {
                let r = Math.pow(1 - Math.min(1, (this.minX - this.x) / overflow), 1.6);
                dx = dx * r;
            }
        } else if (this.x > this.maxX) {
            if (dx > 0) {
                let r = Math.pow(1 - Math.min(1, (this.x - this.maxX) / overflow), 1.6);
                dx = dx * r;
            }
        }

        // 【y】溢出衰减
        if (this.y < this.minY) {
            if (dy < 0) {
                let r = Math.pow(1 - Math.min(1, (this.minY - this.y) / overflow), 1.6);
                dy = dy * r;
            }
        } else if (this.y > this.maxY) {
            if (dy > 0) {
                let r = Math.pow(1 - Math.min(1, (this.y - this.maxY) / overflow), 1.6);
                dy = dy * r;
            }
        }

        // 无需更新
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
            return false;
        }

        // 获取位置
        event.x = this.x + dx;
        event.y = this.y + dy;

        // 执行事件
        this.emit('scroll', event);

        // 行为被阻止
        if (event.defaultPrevented) {
            return false;
        }

        // 更新位置
        translate(this.$$style, this.x = event.x, this.y = event.y);
    }

    /* 指定偏移位置 */
    translateTo(x, y) {
        return this.translateBy(x - this.x, y - this.y);
    }

    /* 滚动到指定位置 */
    scrollTo(x, y, duration, easing) {
        this.scrollBy(x - this.x, y - this.y, duration, easing);
    }

    /* 滚动指定距离 */
    scrollBy(dx, dy, duration, easing = 'linear') {
        if (dx || dy) {

            // 触发动画开始事件
            if (this.$$state.status === 'pending') {
                this.$$state.status = 'moving';
                this.emit('scrollStart');
            }

            // 更新位置
            if (duration && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
                let sx = this.x,
                    sy = this.y;

                // 执行动画
                this.$$anim && this.$$anim.stop();
                this.$$anim = animtate(duration, easing, ({ value, progress }) => {
                    let result;

                    // 更新位置
                    result = this.translateTo(sx + value * dx, sy + value * dy);

                    // 执行滚动结束事件
                    if (result === false || progress >= 1) {

                        // 重置位置
                        if (this.reset(300) === false) {
                            this.$$state.status = 'pending';
                            this.emit('scrollEnd');
                        }

                        // 中上动画
                        this.$$anim = null;
                        return false;
                    }
                });
            } else {
                this.translateBy(dx, dy);
                this.$$state.status = 'pending';
                this.emit('scrollEnd');
            }
        }
    }

    /* 销毁对象 */
    destroy() {

        // 移除事件监听
        this.$$target.removeEvent('touchstart', this.handleStart, { passive: false });
        this.$$target.removeEvent('touchmove', this.handleMove, { passive: false });
        this.$$target.removeEvent('touchcancel', this.handleEnd, { passive: false });
        this.$$target.removeEvent('touchend', this.handleEnd, { passive: false });
        this.$$target.removeEvent('mousedown', this.handleStart, { passive: false });
        this.$$target.removeEvent('mousemove', this.handleMove, { passive: false });
        this.$$target.removeEvent('mousecancel', this.handleEnd, { passive: false });
        this.$$target.removeEvent('mouseup', this.handleEnd, { passive: false });

        // 执行销毁事件回调
        this.emit('destroy');
        this.off();
    }
}
