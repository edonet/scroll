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
import { emitEvent } from './events';


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
        emit('scroll', { x, y }) && translate(ob.x = x, ob.y = y);
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
    ob.on('scroller.touchEnd', ({ dx, dy, dt }) => {
        let { x, y } = overflow(ob.x, ob.y, ob);

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

        // 生成动画
        ob.$anim && ob.$anim.stop();
        ob.$anim = animate(() => {
            let { x, y } = overflow(ob.x, ob.y, ob);

            // 判断是否溢出
            if (x || y) {

                if (ob.bouce) {
                    let duration = Math.min(400, Math.max(Math.abs(dx), Math.abs(dy)) * 10),
                        easing = x => Math.sin(Math.PI * x),
                        { x: sx, y: sy } = ob,
                        r = 30 * duration / 500;

                    // 获取偏移量
                    dx = r * dx / Math.abs(dx) || 0;
                    dy = r * dy / Math.abs(dy) || 0;

                    // 重置动画
                    ob.$anim = animate(duration, easing, ({ value, progress }) => {
                        ob.translateTo(sx + value * dx, sy + value * dy);
                        progress >= 1 && ob.reset();
                    });
                } else {
                    ob.reset(x, y);
                }

                // 中止动画
                return false;
            }

            // 更新偏移量
            dx *= ob.$momentum;
            dy *= ob.$momentum;

            // 更新位置
            return ob.translateBy(dx, dy) || false;
        });
    });

    // 清除数据
    return () => {
        emit = null;
        toucher = toucher.destory();
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
