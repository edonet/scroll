/**
 *****************************************
 * Created by lifx
 * Created on 2018-07-15 14:05:50
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
import style from './app.scss';


/**
 *****************************************
 * 定义组件
 *****************************************
 */
export default class App extends Component {

    /* 初始化组件 */
    constructor(props, ...args) {
        super(props, ...args);

        // 定义属性
        this.$$ref = createRef();
        this.$$scroll = null;

        // 定义状态
        this.state = { count: 50 };

        // 抛出更新方法
        window.$update = count => this.setState({ count });
    }

    /* 渲染列表 */
    render() {
        let list = [],
            len = this.state.count;

        while (len --) {
            list.unshift(<li key={ len }>{ len }</li>);
        }

        return (
            <div className={ style.container } ref={ this.$$ref }>
                <ul className={ style.list }>{ list }</ul>
            </div>
        );
    }

    /* 挂载完成 */
    componentDidMount() {

        // 创建滚动对象
        this.$$scroll = new Scroll(this.$$ref.current, { bounce: true, momentum: true });

        // 监听滚动事件
        this.$$scroll.on('scroll', function (event) {
            console.log('--> scroll', event.x, event.y, this.x, this.y);
        });

        // 监听滚动事件
        this.$$scroll.on('scrollStart', function () {
            console.log('--> start', this.x, this.y);
        });

        // 监听滚动事件
        this.$$scroll.on('scrollEnd', function () {
            console.log('--> end', this.x, this.y);
        });
    }

    /* 更新组件 */
    componentDidUpdate() {
        this.$$scroll && this.$$scroll.refresh();
    }

    /* 卸载组件 */
    componentWillUnmount() {
        this.$$scroll.destroy();
    }
}
