#! /usr/bin/env node

const cli = require('../lib');
const importLocal = require('import-local');

if (importLocal(__filename)) {
  require('npmlog').info('cli', '现在使用 tg-cli 本地版本');
} else {
  require('../lib')(process.argv.slice(2));
}
