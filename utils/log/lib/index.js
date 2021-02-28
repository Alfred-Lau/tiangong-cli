'use strict';

const npmlog = require('npmlog');

npmlog.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'; //环境判断
npmlog.heading = '天工'; // 修改前缀
npmlog.headingStyle = { bg: 'yellow' };
npmlog.addLevel('success', 2000, { fg: 'green', bold: true }); // 添加自定义命令

module.exports = npmlog;
