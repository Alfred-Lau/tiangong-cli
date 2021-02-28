'use strict';

module.exports = log;

const npmlog = require('npmlog');

npmlog.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'; //环境判断
npmlog.heading = 'tg'; // 修改前缀
npmlog.addLevel('success', 2000, { fg: 'green', bold: true }); // 添加自定义命令

function log(argv) {
  npmlog.success(argv);
}
