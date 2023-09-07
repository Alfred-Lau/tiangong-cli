#! /usr/bin/env node

const importLocal = require('import-local');

if (importLocal(__filename)) {
  require('npmlog').info('cli', '现在使用 bitou 本地版本');
} else {
  require('npmlog').info('cli', '使用的是 bitou 全局版本');
  require('../lib')(process.argv.slice(2));
}
