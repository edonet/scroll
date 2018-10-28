/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2018-10-27 18:58:22
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 生成偏移量
 *****************************************
 */
export default function translate(ob, { dx, dy, touch }) {
    let { x, y } = ob,
        { x: ox, y: oy } = overflow(x + dx, y + dy, ob),
        m = touch ? { d: ob.$bounce, f: 5 } : { d: ob.$bounce / 5, f: 2 };


    // 限制滚动方向
    ob.$scrollX || (dx = 0);
    ob.$scrollY || (dy = 0);

    // 处理【x】溢出
    if (ox && ox * dx < 0) {
        let sx = m.f * Math.max(0, 1 - Math.pow(ox / m.d, 2));

        // 处理超出速度
        if (sx < Math.abs(dx)) {
            dx = dx > 0 ? sx : -sx;
        }
    }

    // 处理【y】溢出
    if (oy && oy * dy < 0) {
        let sy = m.f * Math.max(0, 1 - Math.pow(oy / m.d, 2));

        // 处理超出速度
        if (sy < Math.abs(dy)) {
            dy = dy > 0 ? sy : -sy;
        }
    }

    // 返回结果
    return { dx, dy, ox, oy };
}


/**
 *****************************************
 * 获取溢出值
 *****************************************
 */
export function overflow(x, y, { $minX, $minY, $maxX, $maxY }) {
    return {
        x: x < $minX ? $minX - x : x > $maxX ? $maxX - x : 0,
        y: y < $minY ? $minY - y : y > $maxY ? $maxY - y : 0
    };
}
