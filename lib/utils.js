/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-24 10:55:05
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 判断是否支持【passive】
 *****************************************
 */
export const isSupportPassive = (() => {
    let support = false;

    // 判断属性是否可用
    try {
        window.addEventListener('test', null, {
            get passive() {
                support = true;
            }
        });
    } catch (err) {
        // do nothing;
    }

    // 返回结果
    return support;
})();


/**
 *****************************************
 * 创建事件配置对象
 *****************************************
 */
export const createEventOptions = options => {

    // 降级处理
    if (typeof options === 'object') {
        return isSupportPassive ? options : options.capture;
    }

    // 返回对象
    return isSupportPassive ? { capture: options } : options;
};


/**
 *****************************************
 * 阻止页面边界回弹
 *****************************************
 */
document.body.addEventListener(
    'touchmove', event => event.preventDefault(), createEventOptions({ passive: false })
);


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

    return false;
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
 * 支持透视
 *****************************************
 */
export const hasPerspective = (
    prefixStyle('perspective') in document.createElement('div').style
);


/**
 *****************************************
 * 设置变换
 *****************************************
 */
export const transform = (
    key => (style, value) => style[key] = value
)(prefixStyle('transform'));


/**
 *****************************************
 * 设置偏移
 *****************************************
 */
export const translate = (z => (
    (el, x, y) => transform(el, `translate(${x || 0}px, ${y || 0}px)${z}`)
))(hasPerspective ? ' translateZ(0)' : '');


/**
 *****************************************
 * 添加事件
 *****************************************
 */
export function createTarget(el) {
    return {
        addEvent(type, handler, options) {
            return el.addEventListener(type, handler, createEventOptions(options));
        },
        removeEvent(type, handler, options) {
            return el.removeEventListener(type, handler, createEventOptions(options));
        }
    };
}
