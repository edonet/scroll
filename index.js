/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2018-10-29 11:53:34
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载模块
 *****************************************
 */
import Scroll from './lib/scroll';
import Touch from './lib/touch';


/**
 *****************************************
 * 抛出接口
 *****************************************
 */
export { Scroll, Touch };
export default function scroll(options) {
    return new Scroll(options);
}
