"use strict";

const Package = require("@tiangongkit/package");
const log = require("@tiangongkit/log");

// 命令和包的映射
const SETTINGS = {
  init: "@tiangongkit/init",
  publish: "@tiangongkit/init",
  start: "@tiangongkit/init",
};

function exec() {
  // 1， 拿到 targetPath ,转化为 modulePath
  let targetPath = process.env.CLI_TARGET_PATH;
  // 2. 实例化 Package 类

  const version = "latest";
  const name = SETTINGS[arguments[arguments.length - 1].name()];

  if (!targetPath) {
    // 生成缓存路径
    targetPath = "";
  }

  const opts = {
    targetPath,
    name,
    version,
  };

  const pkg = new Package(opts);
  const entryFilePath = pkg.getEntryFilePath();
  console.log("entryFilePath", entryFilePath);

  // 3. 获取入口文件  Package.getRootFile
  // 4. 封装其他方法 到  Package 类上面
}
module.exports = exec;
