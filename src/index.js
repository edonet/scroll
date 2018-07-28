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
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './app';


/**
 *****************************************
 * 渲染页面
 *****************************************
 */
render(
    <AppContainer><App /></AppContainer>,
    document.getElementById('app')
);


/**
 *****************************************
 * 热更新
 *****************************************
 */
if (module.hot) {
    module.hot.accept('./app.js', () => {
        render(
            <AppContainer><App /></AppContainer>,
            document.getElementById('app')
        );
    });
}
