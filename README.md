# @arted/scroll
Arted scroll

## Installation
npm
``` shell
$ npm install @arted/scroll
```

or yarn
``` shell
$ yarn add @arted/scroll
```

## Usage
``` javascript
import Scroll from '@arted/scroll';

// 创建滚动
const scroll = new Scroll('#el');

// 添加滚动事件
scroll.on('scroll', e => {
    // do something;
});

// 销毁滚动
scroll.destroy();
```
