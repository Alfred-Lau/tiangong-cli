"use strict";

const Package = require("@tiangongkit/package");
const log = require("@tiangongkit/log");
const path = require("path");

// 命令和包的映射
const SETTINGS = {
  init: "@tiangongkit/init",
  publish: "@tiangongkit/init",
  start: "@tiangongkit/init",
};

async function exec() {
  // 1， 拿到 targetPath ,转化为 modulePath
  let targetPath = process.env.CLI_TARGET_PATH;
  let storeDir = path.resolve(targetPath, "node_modules");
  // 2. 实例化 Package 类

  const version = "latest";
  const name = SETTINGS[arguments[arguments.length - 1].name()];

  if (!targetPath) {
    // 生成缓存路径
    targetPath = process.env.CLI_TARGET_PATH;
    storeDir = path.resolve(targetPath, "node_modules");

    const opts = {
      targetPath,
      name,
      version,
      storeDir,
    };

    const pkg = new Package(opts);
    await pkg.install();
  } else {
    // targetPath 存在
    const opts = {
      targetPath,
      name,
      version,
      storeDir,
    };

    const pkg = new Package(opts);
    const entryFilePath = pkg.getEntryFilePath();
    console.log("entryFilePath", entryFilePath);
    // 这一段很精彩
    require(entryFilePath).apply(null, arguments);
  }

  // 3. 获取入口文件  Package.getRootFile
  // 4. 封装其他方法 到  Package 类上面
}
module.exports = exec;
