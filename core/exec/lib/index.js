"use strict";

module.exports = exec;

function exec() {
  console.log("exec", process.env.CLI_TARGET_PATH);

  // 1， 拿到 targetPath ,转化为 modulePath
  // 2. 实例化 Package 类
  // 3. 获取入口文件  Package.getRootFile
  // 4. 封装其他方法 到  Package 类上面
}
