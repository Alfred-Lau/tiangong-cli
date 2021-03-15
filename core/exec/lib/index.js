"use strict";

const Package = require("@tiangongkit/package");

function exec() {
  console.log("exec", process.env.CLI_TARGET_PATH);

  // 1， 拿到 targetPath ,转化为 modulePath
  // 2. 实例化 Package 类

  const pkg = new Package([]);

  // 3. 获取入口文件  Package.getRootFile
  // 4. 封装其他方法 到  Package 类上面
}
module.exports = exec;
