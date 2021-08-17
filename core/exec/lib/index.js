"use strict";

const Package = require("@tiangongkit/package");
const log = require("@tiangongkit/log");
const path = require("path");

// 命令和包的映射
const SETTINGS = {
    // init: "@tiangongkit/init",
    init: "foo",
    publish: "@tiangongkit/init",
    start: "@tiangongkit/init",
};

const CACHE_DIR = "dependencies";

async function exec() {
    // 1， 拿到 targetPath ,转化为 modulePath
    let targetPath = process.env.CLI_TARGET_PATH;
    let homePath = process.env.CLI_HOME_PATH;
    let storeDir = "";
    // 2. 实例化 Package 类

    const version = "latest";
    const name = SETTINGS[arguments[arguments.length - 1].name()];

    if (!targetPath) {
        // 生成缓存路径【绝对路径】
        targetPath = path.resolve(homePath, CACHE_DIR);
        storeDir = path.resolve(targetPath, "node_modules");

        const opts = {
            targetPath,
            name,
            version,
            storeDir,
        };
        const pkg = new Package(opts);

        if (!(await pkg.exists())) {
            await pkg.install();
        } else {
            await pkg.update();
        }
    } else {
        // targetPath 存在
        const opts = {
            targetPath,
            name,
            version,
        };

        const pkg = new Package(opts);
        const entryFilePath = pkg.getEntryFilePath();
        log.verbose("entryFilePath", entryFilePath);
        // 这一段很精彩
        require(entryFilePath).apply(null, arguments);
    }

    // 3. 获取入口文件  Package.getRootFile
    // 4. 封装其他方法 到  Package 类上面
}
module.exports = exec;
