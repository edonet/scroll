/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-26 17:39:51
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 获取浏览器前缀
 *****************************************
 */
export const vendor = (() => {
    var style = document.createElement('div').style,
        vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'];

    for (let vendor of vendors) {
        if ((vendor + 'ransform') in style) {
            return vendor.slice(0, -1);
        }
    }

    return '';
})();


/**
 *****************************************
 * 补全浏览器前缀
 *****************************************
 */
export const prefixStyle = style => {
    return vendor ? vendor + style.charAt(0).toUpperCase() + style.substr(1) : style;
};


/**
 *****************************************
 * 偏移元素
 *****************************************
 */
export function translateStyle(style, key = prefixStyle('transform')) {
    return function translate(x, y) {
        return style[key] = `translate(${x || 0}, ${y || 0}) translateZ(0)`;
    };
}
