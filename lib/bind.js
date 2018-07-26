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


/**
 *****************************************
 * 加载事件
 *****************************************
 */
export default function bind(ob) {
    let translate = translateStyle(ob.$scroller.style),
        emit = createEmitter(ob),
        toucher = new Touch(ob.$el, emit);

    // 更新位置
    ob.on('scroller.translateTo', (x, y) => {
        emit('scroll', { x, y }) && translate(ob.x = x, ob.y = y);
    });

    // 滚动指定距离
    ob.on('scroller.scrollBy', (dx, dy, duration, easing) => {
        let { x, y } = ob;

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

    // 清除数据
    return () => {
        emit = null;
        toucher = toucher.destory();
        translate = null;
    };
}
