/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2018-10-26 10:40:46
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import EventEmitter from '@arted/utils/events';
import { addBodyEvent } from '@arted/web/events';
import bind from './bind.js';


/**
 *****************************************
 * 滚动对象
 *****************************************
 */
export default class Scroll extends EventEmitter {

    /* 初始化对象 */
    constructor(el, options) {
        super();

        // 定义属性
        this.x = 0;
        this.y = 0;
        this.scale = 1;

        // 获取元素
        this.$el = el;
        this.$scroller = el.firstElementChild || el.firstChild;
        this.$el.classList.add('art-scroll');

        // 定义私有属性
        this.$minX = 0;
        this.$minY = 0;
        this.$maxX = 0;
        this.$maxY = 0;
        this.$scrollX = false;
        this.$scrollY = true;
        this.$scale = false;
        this.$bounce = 150;
        this.$momentum = .95;
        this.$status = 'pending';

        // 绑定事件
        this.$$toucher = bind(this);

        // 刷新元素
        this.refresh(options);
    }

    /* 刷新元素 */
    refresh(options) {

        // 更新滚动范围
        this.$minX = Math.min(0, this.$el.clientWidth - this.$scroller.clientWidth);
        this.$minY = Math.min(0, this.$el.clientHeight - this.$scroller.clientHeight);

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
                if (typeof options.bounce !== 'number') {
                    this.$bounce = options.bounce ? 150 : 0;
                } else {
                    this.$bounce = Math.max(0, Math.min(200, options.bounce));
                }
            }

            // 更新【momentum】
            if ('momentum' in options) {
                if (typeof options.momentum !== 'number') {
                    this.$momentum = options.momentum ? .95 : 0;
                } else {
                    this.$momentum = Math.max(0, Math.min(.99, options.momentum));
                }
            }

            // 更新位置
            this.translateTo(options.startX || this.x, options.startY || this.y);
        }

        // 重置位置
        return this.reset();
    }

    /* 重设位置 */
    reset(dx, dy, duration = true) {

        // 重置参数
        if (arguments.length < 2) {
            duration = dx || 0;
            dx = Math.max(this.$minX, Math.min(this.$maxX, this.x)) - this.x;
            dy = Math.max(this.$minY, Math.min(this.$maxY, this.y)) - this.y;
        }

        // 判断是否需要更新
        if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) {
            if (duration === true) {
                duration = Math.min(350, Math.max(Math.abs(dx), Math.abs(dy)) * 10);
            }

            // 执行滚动
            return this.scrollBy(dx, dy, duration, 'ease-out');
        }

        // 结束滚动
        this.$status === 'pending' || this.emit('scrollEnd');
        this.$status = 'pending';

        // 没有更新
        return false;
    }

    /* 偏移到指定指定位置 */
    translateTo(x, y) {
        return this.translateBy(x - this.x, y - this.y);
    }

    /* 偏移指定距离 */
    translateBy(dx = 0, dy = 0) {

        // 判断是否需要滚动
        if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) {
            return this.$$toucher.dispatch('translateBy', { dx, dy });
        }

        // 没有更新
        return false;
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

            // 执行滚动
            if (duration > 50 && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                return this.$$toucher.dispatch('scrollBy', { dx, dy, duration, easing });
            }

            // 设置偏移
            this.translateBy(dx, dy);
            return this.reset();
        }

        // 没有更新
        return false;
    }

    /* 销毁对象 */
    destroy() {

        // 清空元素
        this.$el = null;
        this.$scroller = null;

        // 取消事件监听
        this.$$toucher = this.$$toucher.destroy() && null;

        // 执行销毁事件回调
        this.emit('destroy');
        this.off();
    }
}


/**
 *****************************************
 * 绑定阻止【body】回弹事件
 *****************************************
 */
addBodyEvent('touchmove', event => {
    let el = event.target,
        body = document.body;

    // 遍历事件路径
    while (el) {
        if (el === body) {
            break;
        }

        // 判断是否需要可滚动
        if (el.classList && el.classList.contains('art-scroll')) {
            return event.preventDefault();
        }

        // 更新节点
        el = el.parentNode;
    }
});
