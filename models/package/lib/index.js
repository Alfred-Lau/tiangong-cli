"use strict";
const { isObject } = require("@tiangongkit/utils");
class Package {
  constructor(options) {
    if (!options) {
      throw new Error("Package 类的 options 参数不能为空");
    }
    if (!isObject(options)) {
      throw new Error("Package 类的 options 参数必须为对象");
    }
    this.packageName = options.name;
    this.version = options.version;

    this.targetPath = options.targetPath;
    this.storePath = options.storePath;
  }
}

module.exports = Package;
