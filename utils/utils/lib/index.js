"use strict";
const log = require("@tiangongkit/log");
const cp = require("child_process");
const fse = require("fs-extra");

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

/**
 *导出转圈函数
 *
 * @param {*} msg
 * @param {string} [spainnerString="|/-\\"]
 * @return {*}
 */
function spinnerStart(msg, spainnerString = "|/-\\") {
  const Spinner = require("cli-spinner").Spinner;
  const spinner = new Spinner(msg + " %s");
  spinner.setSpinnerString(spainnerString);
  spinner.start();
  return spinner;
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
function readFile(file, options = {}) {
  fse.ensureFileSync(file);
  if (!fse.existsSync(file)) {
    throw new Error("需要读取的文件不存在");
  }
  const content = fse.readFileSync(file, options);
  try {
    if (options.toJson) {
      return content.toJSON();
    } else {
      return content.toString();
    }
  } catch (error) {
    console.log(error.message);
  }
}

function writeFile(file, data, { rewrite = true } = {}) {
  fse.ensureFileSync(file);
  fse.writeFileSync(file, data);
}
module.exports = {
  isObject,
  execute,
  readFile,
  writeFile,
  spinnerStart,
};
