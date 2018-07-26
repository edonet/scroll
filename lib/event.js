/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-26 15:32:50
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 判断是否支持【passive】
 *****************************************
 */
const passivable = (() => {
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
 * 阻止页面边界回弹
 *****************************************
 */
document.body.addEventListener(
    'touchmove', event => event.preventDefault(), passivable && { passive: false }
);


/**
 *****************************************
 * 添加事件
 *****************************************
 */
export function addEvent(el, type, handler, options) {
    return el.addEventListener(type, handler, passivable && options);
}


/**
 *****************************************
 * 移除事件
 *****************************************
 */
export function removeEvent(el, type, handler, options) {
    return el.addEventListener(type, handler, passivable && options);
}


/**
 *****************************************
 * 创建事件
 *****************************************
 */
export function createEmitter(target) {
    return function emit(type, data) {
        let isDefaultPrevented = false;

        // 执行事件
        target.emit(type, Object.create(data, {
            preventDefault() {
                isDefaultPrevented = true;
            },
            defaultPrevented: {
                get() {
                    return isDefaultPrevented;
                }
            }
        }));

        // 返回执行结果
        return !isDefaultPrevented;
    };
}
