/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-26 14:58:53
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import EventEmitter from '@arted/utils/events';
import bind from './bind';


/**
 *****************************************
 * 创建滚动对象
 *****************************************
 */
export default class Scroller extends EventEmitter {

    /* 初始化对象 */
    constructor(el, options) {
        super();

        // 定义属性
        this.x = 0;
        this.y = 0;

        // 获取元素
        this.$el = el;
        this.$scroller = el.firstElementChild || el.firstChild;

        // 定义私有属性
        this.$anim = null;
        this.$status = 'pending';
        this.$minX = 0;
        this.$minY = 0;
        this.$maxX = 0;
        this.$maxY = 0;
        this.$scrollX = false;
        this.$scrollY = true;
        this.$bounce = 150;
        this.$momentum = .98;

        // 绑定事件
        this.$$unbind = bind(this);

        // 刷新元素
        this.refresh(options);
    }

    /* 刷新元素 */
    refresh(options) {

        // 更新配置
        if (options && typeof options === 'object') {

            // 更新【scrollX】
            if ('scrollX' in options) {
                this.$scrollX = options.scrollX;
            }

            // 更新【scrollY】
            if ('scrollY' in options) {
                this.$scrollY = options.scrollY;
            }

            // 更新【bounce】
            if ('bounce' in options) {
                this.$bounce = options.bounce;
            }

            // 更新【momentum】
            if (typeof options.momentum !== 'number') {
                this.$momentum = options.momentum ? .98 : 0;
            } else {
                this.$momentum = Math.max(0, Math.min(.99, options.momentum));
            }

            // 更新位置
            this.translateTo(options.startX || this.x, options.startY || this.y);
        }

        // 更新滚动范围
        this.$minX = Math.min(0, this.$$el.clientWidth - this.$$scroller.clientWidth);
        this.$minY = Math.min(0, this.$$el.clientHeight - this.$$scroller.clientHeight);

        // 重置位置
        this.reset();
    }

    /* 重设位置 */
    reset(duration) {
        let x = Math.max(this.minX, Math.min(this.maxX, this.x)),
            y = Math.max(this.minY, Math.min(this.maxY, this.y)),
            dx = x - this.x,
            dy = y - this.y;

        // 判断是否需要更新
        if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) {
            if (duration === true) {
                duration = Math.max(Math.abs(dx), Math.abs(dy)) * 2;
            }

            // 执行滚动
            return this.scrollBy(dx, dy, duration, 'ease-out');
        }

        // 结束滚动
        this.$status === 'pending' || this.emit('scrollEnd');
        this.$status = 'pending';
    }

    /* 滚动到指定位置 */
    scrollTo(x, y, duration, easing) {
        return this.scrollBy(x - this.x, y - this.y, duration, easing);
    }

    /* 滚动指定距离 */
    scrollBy(dx, dy, duration, easing = 'linear') {
        if (dx || dy) {

            // 更新状态
            this.$status === 'pending' && this.emit('scrollStart');
            this.$status = 'animating';

            // 执行滚动
            if (duration > 50 && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                return this.emit('scroller.scrollBy', dx, dy, duration, easing);
            }

            // 设置偏移
            this.translateBy(dx, dy);
            this.reset();
        }
    }

    /* 偏移到指定指定位置 */
    translateTo(x, y) {
        return this.translateBy(x - this.x, y - this.y);
    }

    /* 偏移指定距离 */
    translateBy(dx, dy) {
        if (dx || dy) {
            if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) {
                return this.emit('scroller.translateTo', this.x + dx, this.y + dy);
            }
        }
    }

    /* 销毁对象 */
    destroy() {

        // 清空元素
        this.$el = null;
        this.$scroller = null;

        // 取消事件监听
        this.$$unbind = this.$$unbind() && null;

        // 执行销毁事件回调
        this.emit('destroy');
        this.off();
    }
}
