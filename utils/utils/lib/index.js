"use strict";
const log = require("@tiangongkit/log");
const cp = require("child_process");

/**
 *多平台兼容处理
 *
 * @param {*} cmd 运行命令
 * @param {*} argv 运行参数
 * @param {*} opt 运行选项
 * @return {*}
 */
function spawn(cmd, argv, opt) {
  const isWin32 = process.platform === "win32";
  const specifiedCmd = isWin32 ? "cmd" : cmd;
  const specifiedArgs = isWin32 ? ["/c", cmd, ...argv] : argv;

  return cp.spawn(specifiedCmd, specifiedArgs, opt);
}

function isObject(o) {
  if (!o) {
    return false;
  }
  return Object.prototype.toString.call(o) === "[object Object]";
}

// 把一个同步函数改造成异步的方式，就是返回一个 promise ，然后await 它
function execute(params) {
  return new Promise(function (resolve, reject) {
    const child = spawn(...params);

    //  子进程本身的设置
    child.on("error", (e) => {
      reject(e);
    });
    child.on("exit", (e) => {
      resolve(e);
    });
  });
}

module.exports = {
  isObject,
  execute,
};
