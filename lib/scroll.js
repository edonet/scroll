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
import { createTarget, translate } from './utils';
import { onScrollStart, onScroll, onScrollEnd, emitEvent, thwarted } from './events';


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
        this.scrollX = false;
        this.scrollY = true;
        this.bounce = 150;
        this.momentum = .98;
        this.status = 'pending';

        // 绑定回调
        this.handleStart = throttle(onScrollStart.bind(this));
        this.handleMove = throttle(onScroll.bind(this));
        this.handleEnd = throttle(onScrollEnd.bind(this));

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

    /* 刷新列表 */
    refresh(options) {

        // 更新配置
        if (options && typeof options === 'object') {

            // 更新【scrollX】
            if ('scrollX' in options) {
                this.scrollX = options.scrollX;
            }

            // 更新【scrollY】
            if ('scrollY' in options) {
                this.scrollY = options.scrollY;
            }

            // 更新【bounce】
            if ('bounce' in options) {
                this.bounce = !! options.bounce;
            }

            // 更新【momentum】
            if (typeof options.momentum !== 'number') {
                this.momentum = options.momentum === false ? 0 : .98;
            } else {
                this.momentum = Math.max(0, Math.min(.99, options.momentum));
            }

            // 更新位置
            this.translateTo(options.startX || this.x, options.startY || this.y);
        }

        // 更新滚动范围
        this.minX = Math.min(0, this.$$el.clientWidth - this.$$scroller.clientWidth);
        this.minY = Math.min(0, this.$$el.clientHeight - this.$$scroller.clientHeight);

        // 重置位置
        this.reset();
    }

    /* 重置位置 */
    reset(duration) {
        let x = Math.max(this.minX, Math.min(this.maxX, this.x)),
            y = Math.max(this.minY, Math.min(this.maxY, this.y)),
            dx = x - this.x,
            dy = y - this.y;

        // 判断是否需要更新
        if (dx || dy) {
            if (duration === true) {
                duration = Math.max(Math.abs(dx), Math.abs(dy)) * 2;
            }

            return this.scrollBy(dx, dy, duration, 'ease-out');
        }

        // 无需重置
        return false;
    }

    /* 指定偏移距离 */
    translateBy(dx, dy) {
        if (dx || dy) {
            let data = thwarted.call(this, dx, dy);

            // 无需更新
            if (Math.abs(data.dx) < 1 && Math.abs(data.dy) < 1) {
                return false;
            }

            // 获取位置
            data.x = this.x + data.dx;
            data.y = this.y + data.dy;

            // 更新位置
            if (!emitEvent.call(this, 'scroll', data)) {
                return translate(this.$$style, this.x = data.x, this.y = data.y);
            }
        }

        return false;
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
            this.status === 'pending' && this.emit('scrollStart');
            this.status = 'animating';

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
                        if (this.reset(true) === false) {
                            this.status = 'pending';
                            this.emit('scrollEnd');
                        }

                        // 中上动画
                        this.$$anim = null;
                        return false;
                    }
                });
            } else {
                this.translateBy(dx, dy);
                this.status = 'pending';
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
