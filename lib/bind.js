/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2018-10-26 13:58:43
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import stylify from '@arted/style/utils';
import animate from '@arted/animate';
import Toucher from './toucher';
import translate from './translate';


/**
 *****************************************
 * 绑定滚动事件
 *****************************************
 */
export default function bind(ob) {
    let toucher = new Toucher(ob.$el),
        styled = stylify(ob.$scroller),
        anim = null;

    // 监听触控开始
    toucher.on('touchStart', event => {

        // 清除动画
        anim = anim && anim.stop() && null;

        // 触发事件
        if (!ob.dispatch('scrollStart', ob)) {
            event.preventDefault();
        }
    });

    // 监听触控移动
    toucher.on('touchMove', event => {
        let { dx: tx, dy: ty } = toucher.center,
            { dx, dy } = translate(ob, { dx: tx, dy: ty, touch: true });

        // 更新位置
        if (!toucher.dispatch('translateBy', { dx, dy })) {
            event.preventDefault();
        }
    });

    // 监听触控结束
    toucher.on('touchEnd', () => {
        let { dx: tx, dy: ty } = toucher.center,
            { ox, oy, dx, dy } = translate(ob, { dx: tx, dy: ty, touch: false });

        // 处理溢出
        if (oy || ox) {
            return ob.reset(ox, oy);
        }

        // 更新位置
        if (!toucher.dispatch('translateBy', { dx, dy })) {
            return ob.reset(ox, oy);
        }

        // 启动动画
        anim && anim.stop();
        anim = animate(({ stop }) => {
            let { dx: ax, dy: ay, ox, oy } = translate(ob, { dx, dy, touch: false });

            // 更新位置
            if (!toucher.dispatch('translateBy', { dx: ax, dy: ay })) {
                anim = false;
                ob.reset(ox, oy, 300);
                return stop();
            }

            console.log(ax, ay)

            // 更新偏移
            dx = ax * ob.$momentum;
            dy = ay * ob.$momentum;
        });
    });

    // 监听偏移到指定位置
    toucher.on('translateBy', event => {
        let { dx, dy } = event;

        // 限制滚动方向
        ob.$scrollX || (dx = 0);
        ob.$scrollY || (dy = 0);

        // 更新位置
        if (Math.abs(dy) > 1 || Math.abs(dx) > 1) {
            return toucher.dispatch('translateTo', {
                x: ob.x + dx,
                y: ob.y + dy
            });
        }

        // 无需更新
        event.preventDefault();
    });

    // 监听偏移到指定位置
    toucher.on('translateTo', event => {
        let { x, y, scale = 1 } = event;

        // 派发事件
        if (!ob.dispatch('scroll', { x, y, scale })) {
            return event.preventDefault();
        }

        // 更新位置
        ob.x = x;
        ob.y = y;
        ob.scale = scale;
        styled.scale(scale, x, y);
    });

    // 监听滚动指定距离
    toucher.on('scrollBy', ({ dx, dy, duration, easing }) => {
        let { x, y } = ob;

        // 更新状态
        ob.$status = 'animating';

        // 定义动画
        anim && anim.stop();
        anim = animate(duration, easing, ({ value, progress }) => {
            let data = { x: x + dx * value, y: y + dy * value };

            // 更新位移
            if (!toucher.dispatch('translateTo', data) || progress >= 1) {
                ob.reset(true);
                anim = null;
                return false;
            }
        });
    });

    // 监听销毁事件
    toucher.on('destroy', () => {
        ob = null;
        toucher = null;
        anim = anim && anim.stop() && null;
    });

    // 返回触控器
    return toucher;
}
