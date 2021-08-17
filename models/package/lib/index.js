"use strict";

const path = require("path");
const fs = require("fs");
const { isObject } = require("@tiangongkit/utils");
const formatPath = require("@tiangongkit/format-path");
const { getDefaultRegistry } = require("@tiangongkit/get-npm-info");
const log = require("@tiangongkit/log");
const pkgDir = require("pkg-dir").sync;
const npminstall = require("npminstall");

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
        // package 的路径
        this.targetPath = options.targetPath;
        this.storeDir = options.storeDir;
    }
    // 判断当前 package 是否存在
    exists() {
        const target = path.resolve(this.targetPath, this.packageName);
        log.verbose("需要拉取的程序所在的地址", target);
        return fs.existsSync(target);
    }
    // 安装
    async install() {
        log.verbose("开始安装程序");
        await npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [{ name: this.packageName, version: this.version }],
        });
    }
    // 更新
    update() {
        // 判断当前 package 是否存在
        log.verbose("开始更新程序");
    }

    // 获取入口文件的路径
    getEntryFilePath() {
        // 1.  获取package.json所在目录 pkg-dir
        const rootPath = pkgDir(this.targetPath);
        // 2. 读取 package.json
        if (rootPath) {
            const pkg = require(path.resolve(rootPath, "package.json"));
            // 3. 找到 main/lib path
            if (pkg && (pkg.main || pkg.lib)) {
                // 4. 路径的兼容
                return formatPath(path.resolve(rootPath, `${pkg.main}`));
            } else {
                return path.resolve(rootPath, "index.js");
            }
        } else {
            return null;
        }
    }
}

module.exports = Package;
