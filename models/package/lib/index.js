"use strict";
const { isObject } = require("@tiangongkit/utils");
class Package {
  constructor(options) {
    console.log(options);
    if (!options) {
      throw new Error("Package 类的 options 参数不能为空");
    }
    if (!isObject(options)) {
      throw new Error("Package 类的 options 参数必须为对象");
    }
    this.packageName = options.name;
    this.version = options.version;
    // package 的路径
    this.targetPath = options.targetPath;
    this.storePath = options.storePath;
  }
  // 判断当前 package 是否存在
  exists() {}
  // 安装
  install() {}
  // 更新
  update() {}
  // 获取入口文件的路径
  getEntryFilePath() {
    //1.  获取package.json所在目录 pkg-dir
  }
}

module.exports = Package;
