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
import animate from '@arted/animate';
import Toucher from './toucher';


/**
 *****************************************
 * 绑定滚动事件
 *****************************************
 */
export default function bind(scroller) {
    let toucher = new Toucher(scroller.$el),
        anim = null;

    // 监听触控开始
    toucher.on('touchStart', event => {
        console.log(event.touches);
    });

    // 监听触控移动
    toucher.on('touchMove', event => {
        console.log(event.touches);
    });

    // 监听触控结束
    toucher.on('touchEnd', event => {
        console.log(event.touches);
    });

    // 监听偏移到指定位置
    toucher.on('translateTo', event => {
        console.log(event);
    });

    // 监听滚动指定距离
    toucher.on('scrollBy', event => {
        console.log(event);
    });

    // 监听销毁事件
    toucher.on('destroy', () => {
        scroller = null;
        toucher = null;
        anim = anim && anim.stop() && null;
    });

    // 返回触控器
    return toucher;
}
