"use strict";

const Package = require("@tiangongkit/package");
const log = require("@tiangongkit/log");
const path = require("path");
const cp = require("child_process");

// 命令和包的映射
const SETTINGS = {
    init: "@tiangongkit/init",
    publish: "@tiangongkit/init",
    start: "@tiangongkit/init",
};

const CACHE_DIR = "dependencies";

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

async function exec() {
    // 1， 拿到 targetPath ,转化为 modulePath
    let targetPath = process.env.CLI_TARGET_PATH;
    let homePath = process.env.CLI_HOME_PATH;
    let storeDir = "";
    let pkg = null;
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
        pkg = new Package(opts);

        try {
            if (!(await pkg.exists())) {
                await pkg.install();
            } else {
                await pkg.update();
            }
        }catch (e) {
            log.error(e.message)
            process.exit(1)
        }


    } else {
        // targetPath 存在
        const opts = {
            targetPath,
            name,
            version,
        };

        pkg = new Package(opts);
    }

    // TODO:3. 获取入口文件  Package.getRootFile

    const entryFilePath = pkg.getEntryFilePath();
    log.verbose("entryFilePath", entryFilePath);
    // 这一段很精彩
    try {
        const args = Array.from(arguments);
        // 纯化参数对象
        const fuzzyOptionsObject = args[args.length - 1];
        const pureOptionsObject = Object.create(null);
        Object.keys(fuzzyOptionsObject).forEach((arg) => {
            if (
                fuzzyOptionsObject.hasOwnProperty(arg) &&
                !arg.startsWith("_") &&
                arg !== "parent"
            ) {
                pureOptionsObject[arg] = fuzzyOptionsObject[arg];
            }
        });
        args[args.length - 1] = pureOptionsObject;
        const code = `require('${entryFilePath}').call(null, ${JSON.stringify(
            args
        )})`;
        const child = spawn("node", ["-e", code], {
            // 子进程的 stdio 的设置
            cwd: process.cwd(),
            // 把父进程的 io 句柄给到 子进程
            stdio: "inherit",
        });

        //  子进程本身的设置
        child.on("error", (e) => {
            log.error(e);
            process.exit(1);
        });
        child.on("exit", (e) => {
            log.verbose("命令执行成功:" + e);
            process.exit(e);
        });
    } catch (error) {
        log.error(error.message);
    }
    // 4. 封装其他方法 到  Package 类上面
}
module.exports = exec;
