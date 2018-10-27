/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2018-10-27 13:10:04
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import React, { Component, createRef } from 'react';
import Scroll from '../lib/scroll';
import url from './01.jpg';


/**
 *****************************************
 * 图片浏览器
 *****************************************
 */
export default class ImageBrowser extends Component {

    /* 初始化组件 */
    constructor(props, ...args) {
        super(props, ...args);

        // 定义属性
        this.$ref = createRef();

        // 绑定回调
        this.onload = this.onload.bind(this);
    }

    /* 渲染组件 */
    render() {
        return (
            <div className="abs box ovhd" ref={ this.$ref }>
                <img src={ url } onLoad={ this.onload } />
            </div>
        );
    }

    /* 组件加载完成 */
    onload() {
        this.$scroll = new Scroll(this.$ref.current, { scrollX: true });
        console.log(this.$scroll);
    }
}
