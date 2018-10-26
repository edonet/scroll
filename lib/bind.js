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
import Toucher from './toucher';


/**
 *****************************************
 * 绑定滚动事件
 *****************************************
 */
export default function bind(toucher) {

    // 监听触控开始
    toucher.on('touchStart', function (event) {
        console.log(this, event);
    });

    // 返回触控器
    return toucher;
}
