"use strict";

const path = require("path");
const fsPromises = require("fs").promises;

const { isObject } = require("@tiangongkit/utils");
const formatPath = require("@tiangongkit/format-path");
const {
    getDefaultRegistry,
    getNpmLatestVersion,
} = require("@tiangongkit/get-npm-info");
const log = require("@tiangongkit/log");
const pkgDir = require("pkg-dir").sync;
const fse = require("fs-extra");
const npminstall = require("npminstall");

async function pathExists(_path) {
    try {
        await fsPromises.access(path);
        return true;
    } catch {
        return false;
    }
}

class Package {
    constructor(options) {
        if (!options) {
            throw new Error("Package 类的 options 参数不能为空");
        }
        if (!isObject(options)) {
            throw new Error("Package 类的 options 参数必须为对象");
        }
        //  包名称
        this.packageName = options.name;
        // 包版本
        this.version = options.version;
        // package 的路径
        this.targetPath = options.targetPath;
        this.storeDir = options.storeDir;
        this.cachePackagePrefix = "";
    }

    get cacheFilePath() {
        log.verbose(
            path.resolve(
                this.storeDir,
                `/_${this.packageName}@${this.version}@${this.packageName}`
            )
        );
        return path.resolve(this.storeDir, `/`);
    }

    async prepare() {
        if (this.storeDir && !(await pathExists(this.storeDir))) {
            fse.mkdirSync(this.storeDir);
        }
        if (this.version === "latest") {
            this.version = await getNpmLatestVersion(this.packageName);
        }
    }
    // 判断当前 package 是否存在
    async exists() {
        if (this.storeDir) {
            // 准备函数:1. 处理缓存逻辑，保证缓存路径存在；2. 替换语义化版本号为最新版本号
            await this.prepare();
            return await pathExists(this.cacheFilePath);
        } else {
            return await pathExists(this.target);
        }
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
        function _getEntryFilePath(_path) {
            // 1.  获取package.json所在目录 pkg-dir
            const rootPath = pkgDir(_path);
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
        //  支持缓存
        if (this.storeDir) {
            log.info("缓存存在");
            return _getEntryFilePath(this.storeDir);
        } else {
            log.info("缓存不存在");

            return _getEntryFilePath(this.targetPath);
        }
    }
}

module.exports = Package;
