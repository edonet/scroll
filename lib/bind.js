/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-26 17:36:52
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import animate from '@arted/animate';
import { translateStyle } from './translate';
import { createEmitter } from './event';
import Toucher from './toucher';


/**
 *****************************************
 * 加载事件
 *****************************************
 */
export default function bind(ob) {
    let translate = translateStyle(ob.$scroller.style),
        emit = createEmitter(ob),
        toucher = new Toucher(ob.$el, emit);

    // 更新位置
    ob.on('scroller.translateTo', (x, y) => {
        emit('scroll', { x, y }) && translate(ob.x = x | 0, ob.y = y | 0);
    });

    // 滚动指定距离
    ob.on('scroller.scrollBy', (dx, dy, duration, easing) => {
        let { x, y } = ob;

        // 更新状态
        ob.$status = 'animating';

        // 定义动画
        ob.$anim && ob.$anim.stop();
        ob.$anim = animate(duration, easing, ({ value, progress }) => {
            if (!ob.translateTo(x + dx * value, y + dy * value) || progress >= 1) {
                ob.$anim = null;
                ob.reset(true);
                return false;
            }
        });
    });

    // 处理滚动开始
    ob.on('scroller.touchStart', () => {

        // 中止动画
        ob.$anim = ob.$anim && ob.$anim.stop() && null;

        // 触发事件
        ob.emit('scrollStart');
    });

    // 处理滚动中
    ob.on('scroller.touchMove', ({ dx, dy }) => {
        let { x, y } = overflow(ob.x + dx, ob.y + dy, ob);

        // 处理【x】溢出
        if (x && x * dx < 0) {
            if (ob.$bounce) {
                dx = dx * Math.pow(1 - Math.min(Math.abs(x) / 300), 3);
            } else {
                dx = x > 0 ? ob.$minX - ob.x : ob.$maxX - ob.x;
            }
        }

        // 处理【y】溢出
        if (y && y * dy < 0) {
            if (ob.$bounce) {
                dy = dy * Math.pow(1 - Math.min(Math.abs(y) / 300), 3);
            } else {
                dy = y > 0 ? ob.$minY - ob.y : ob.$maxY - ob.y;
            }
        }

        // 设置偏移
        ob.translateBy(dx, dy);
    });

    // 处理滚动结束
    ob.on('scroller.touchEnd', async ({ dx, dy, dt }) => {
        let { x, y } = overflow(ob.x, ob.y, ob),
            res;

        // 处理溢出
        if (x || y) {
            return ob.reset(x, y);
        }

        // 滚动结束
        if (!ob.$momentum || (Math.abs(dx / dt) < .2 && Math.abs(dy / dt) < .2)) {
            return ob.reset(0, 0);
        }

        // 更新状态
        ob.$status = 'animating';

        // 限制偏移方向
        ob.$scrollX || (dx = 0);
        ob.$scrollY || (dy = 0);

        // 执行运量动画
        res = await momentumAnim(dx, dy, dt, ob);

        // 处理回弹
        if (res) {
            if (res.type === 'bounce') {
                if (ob.$bounce) {
                    res = await bounceAnim(res, ob);
                } else {
                    res.dx = res.dx < 0 ? ob.$minX - ob.x : res.dx > 0 ? ob.$maxX - ob.x : 0;
                    res.dy = res.dy < 0 ? ob.$minY - ob.y : res.dy > 0 ? ob.$maxY - ob.y : 0;
                }
            }

            // 重设位置
            res && ob.reset(res.dx, res.dy);
        }
    });

    // 清除数据
    return () => {
        emit = null;
        toucher = toucher.destroy();
        translate = null;
    };
}


/**
 *****************************************
 * 获取溢出值
 *****************************************
 */
function overflow(x, y, { $minX, $minY, $maxX, $maxY }) {
    return {
        x: x < $minX ? $minX - x : x > $maxX ? $maxX - x : 0,
        y: y < $minY ? $minY - y : y > $maxY ? $maxY - y : 0
    };
}


/**
 *****************************************
 * 惯性动画
 *****************************************
 */
function momentumAnim(dx, dy, dt, ob) {
    ob.$anim && ob.$anim.stop();
    return ob.$anim = animate(({ stop }) => {
        let x, y, o;

        // 更新偏移量
        dx *= ob.$momentum;
        dy *= ob.$momentum;

        // 中上动画
        if (Math.abs(dy) < 1 && Math.abs(dx) < 1) {
            return stop({ type: 'reset', dx: 0, dy: 0 });
        }

        // 更新数据
        x = ob.x + dx;
        y = ob.y + dy;
        o = overflow(x, y, ob);

        // 判断是否溢出
        if (o.x || o.y) {
            return stop({ type: 'bounce', dx, dy });
        }

        // 更新位置
        ob.emit('scroller.translateTo', x, y);
    });
}


/**
 *****************************************
 * 回弹动画
 *****************************************
 */
function bounceAnim({ dx, dy }, ob, k = .5) {
    return ob.$anim = animate(({ stop }) => {
        dx *= k;
        dy *= k;

        // 退出动画
        if (Math.abs(dy) < 1 && Math.abs(dx) < 1) {
            return stop({
                type: 'reset',
                dx: dx < 0 ? ob.$minX - ob.x : dx > 0 ? ob.$maxX - ob.x : 0,
                dy: dy < 0 ? ob.$minY - ob.y : dy > 0 ? ob.$maxY - ob.y : 0
            });
        }

        // 更新位置
        ob.emit('scroller.translateTo', ob.x + dx, ob.y + dy);
    });
}
