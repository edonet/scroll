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
import Touch from './touch';
import translate from './translate';


/**
 *****************************************
 * 绑定滚动事件
 *****************************************
 */
export default function bind(ob) {
    let touch = new Touch(ob.$el),
        styled = stylify(ob.$scroller),
        anim = null;

    // 监听触控开始
    touch.on('touchStart', event => {

        // 清除动画
        anim = anim && anim.stop() && null;

        // 触发事件
        if (!ob.dispatch('scrollStart', ob)) {
            event.preventDefault();
        }
    });

    // 监听触控移动
    touch.on('touchMove', event => {
        let { dx: tx, dy: ty } = touch.center,
            { dx, dy } = translate(ob, { dx: tx, dy: ty, touch: true });

        // 更新位置
        if (!touch.dispatch('translateBy', { dx, dy })) {
            event.preventDefault();
        }
    });

    // 监听触控结束
    touch.on('touchEnd', () => {
        let { dx: tx, dy: ty } = touch.center,
            { ox, oy, dx, dy } = translate(ob, { dx: tx, dy: ty, touch: false });

        // 处理溢出
        if (oy || ox) {
            return ob.reset(ox, oy);
        }

        // 更新位置
        if (!touch.dispatch('translateBy', { dx, dy })) {
            return ob.reset(ox, oy);
        }

        // 启动动画
        anim && anim.stop();
        anim = animate(({ stop }) => {
            let { dx: ax, dy: ay, ox, oy } = translate(ob, { dx, dy, touch: false });

            // 更新位置
            if (!touch.dispatch('translateBy', { dx: ax, dy: ay })) {
                anim = false;
                ob.reset(ox, oy);
                return stop();
            }

            // 更新偏移
            dx = ax * ob.$momentum;
            dy = ay * ob.$momentum;
        });
    });

    // 监听偏移到指定位置
    touch.on('translateBy', event => {
        let { dx, dy } = event;

        // 更新位置
        if (Math.abs(dy) > 1 || Math.abs(dx) > 1) {
            return touch.dispatch('translateTo', {
                x: ob.x + dx,
                y: ob.y + dy
            });
        }

        // 无需更新
        event.preventDefault();
    });

    // 监听偏移到指定位置
    touch.on('translateTo', event => {
        let { x, y } = event;

        // 派发事件
        if (!ob.dispatch('scroll', { x, y })) {
            return event.preventDefault();
        }

        // 更新位置
        ob.x = x;
        ob.y = y;
        styled.translate(x, y);
    });

    // 监听滚动指定距离
    touch.on('scrollBy', ({ dx, dy, duration, easing }) => {
        let { x, y } = ob;

        // 更新状态
        ob.$status = 'animating';

        // 定义动画
        anim && anim.stop();
        anim = animate(duration, easing, ({ value, progress }) => {
            let data = { x: x + dx * value, y: y + dy * value };

            // 更新位移
            if (!touch.dispatch('translateTo', data) || progress >= 1) {
                ob.reset(true);
                anim = null;
                return false;
            }
        });
    });

    // 监听销毁事件
    touch.on('destroy', () => {
        ob = null;
        touch = null;
        anim = anim && anim.stop() && null;
    });

    // 返回触控器
    return touch;
}
