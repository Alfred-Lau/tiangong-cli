"use strict";
const log = require("@tiangongkit/log");
const Command = require("@tiangongkit/command");
const Package = require("@tiangongkit/package");
const request = require("@tiangongkit/request");
const { execute } = require("@tiangongkit/utils");

const { getDefaultRegistry } = require("@tiangongkit/get-npm-info");
const {
  CLI_COMPONENT_TYPE,
  CLI_PROJECT_TYPE,
  CLI_LIBRARY_TYPE,
} = require("@tiangongkit/shared");
const inquirer = require("inquirer");
const ejs = require("ejs");
const glob = require("glob");
const userHome = require("user-home");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

class InitCommand extends Command {
  init() {
    // 开始初始化
    this.projectName = this._argv[0] || "";
    this.force = !!this._argv[1].force;
    this.targetPath = path.resolve(userHome, ".tg_cli", "template");
    this.storeDir = path.resolve(
      userHome,
      ".tg_cli",
      "template",
      "node_modules"
    );
  }

  async exec() {
    try {
      //  1. 进行执行前准备 [获取项目信息，需要的模板信息]
      const projectInfo = await this.prepare();
      // 1.1 缓存项目信息
      this.projectInfo = projectInfo;
      // 2.  进行模板下载
      await this.downloadTemplates();
      // 3. 进行模板安装到指定新建项目【开始 ejs 渲染项目】
      await this.renderProjectForLibrary(projectInfo);
      // 4. 安装项目依赖
      await this.installProjectDeps(projectInfo);
      // 5. 启动项目
      await this.start(projectInfo);
    } catch (e) {
      log.error("", e.message);
    }
  }

  async start(info) {
    const { startCmd = ["npm", ["run", "dev"]], title } = info;
    const startPath = path.resolve(process.cwd(), title);

    startCmd.push({ cwd: startPath, stdio: "inherit" });
    try {
      log.verbose("start", startCmd);
      const child = execute(startCmd);
    } catch (error) {
      log.error("start deps", error);
    }
  }

  async installProjectDeps(info) {
    const {
      installCmd = ["npm", ["install", `--registry=${getDefaultRegistry()}`]],
      title,
    } = info;
    const installPath = path.resolve(process.cwd(), title);
    installCmd.push({ cwd: installPath, stdio: "inherit" });

    try {
      const child = execute(installCmd);
    } catch (error) {
      log.error("install deps", error);
    }
  }

  async downloadTemplates() {
    const { projectName, version } = this.projectInfo;
    // 生成模板存储路径 和 模板缓存路径
    const targetPath = this.targetPath;
    const storeDir = this.storeDir;

    const opts = {
      targetPath,
      name: projectName,
      version,
      storeDir,
    };
    const templateNpm = new Package(opts);
    try {
      // star to download
      if (await templateNpm.exists()) {
        //  start to update
        await templateNpm.update();
      } else {
        await templateNpm.install();
        log.verbose("", "更新程序成功");
      }
    } catch (error) {
      log.error(error.message);
    }
  }

  async renderProjectForLibrary(info) {
    const { projectName, title } = info;
    // 输出路径
    const currentCwd = process.cwd();
    // 生成模板存储路径 和 模板缓存路径
    const globPathPattern = path.resolve(this.storeDir, projectName);
    return new Promise((resolve, reject) => {
      glob(
        `**/*`,
        {
          cwd: globPathPattern,
          ignore: ["node_modules/**", "src"],
          nodir: true,
        },
        (err, files) => {
          if (!err) {
            //  开始渲染页面
            Promise.all(
              files.map((file) => {
                const source = path.resolve(globPathPattern, file);
                const target = path.resolve(currentCwd, title, file);
                return new Promise((resolve2, reject2) => {
                  ejs.renderFile(source, info, {}, (err, result) => {
                    if (!err) {
                      fse.ensureFileSync(target);
                      fs.writeFileSync(target, result, { encoding: "utf-8" });
                      resolve2(result);
                    } else {
                      reject2(err);
                    }
                  });
                });
              })
            )
              .then(() => resolve())
              .catch((err) => reject(err));
          } else {
            reject(err);
          }
        }
      );
    });
  }
  /**
   * 获取项目模板列表
   *
   * @memberof InitCommand
   */
  async getProjectTemplates() {
    const templates = await request("/api/cli/template/list");
    if (!templates || templates.length === 0) {
      throw new Error("项目模板不存在");
    }
    this.templates = templates;
  }

  async prepare() {
    // 检查模板是否存在
    await this.getProjectTemplates();
    const localPath = process.cwd();
    if (!this.isEmptyDir(localPath)) {
      let ifContinue = false;
      if (!this.force) {
        // 询问是否继续创建
        ifContinue = (
          await inquirer.prompt({
            type: "confirm",
            name: "ifContinue",
            default: false,
            message: "当前文件夹不为空，是否继续创建项目？",
          })
        ).ifContinue;
        if (!ifContinue) {
          return;
        }
      }
      // 2. 是否启动强制更新
      if (ifContinue || this.force) {
        // 给用户做二次确认
        const { confirmDelete } = await inquirer.prompt({
          type: "confirm",
          name: "confirmDelete",
          default: false,
          message: "是否确认清空当前目录下的文件？",
        });
        if (confirmDelete) {
          // 清空当前目录
          fse.emptyDirSync(localPath);
        }
      }
    }

    return this.getProjectInfo();
  }

  async getProjectInfo() {
    function isValidName(v) {
      return /^(@[a-zA-Z0-9-_]+\/)?[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
        v
      );
    }
    let projectInfo = {};
    let isProjectNameValid = false;
    if (isValidName(this.projectName)) {
      isProjectNameValid = true;
      projectInfo.projectName = this.projectName;
    }
    // 选择创建项目或者是组件
    const { type } = await inquirer.prompt({
      type: "list",
      name: "type",
      message: "请选择初始化类型",
      default: CLI_PROJECT_TYPE,
      choices: [
        { name: "项目", value: CLI_PROJECT_TYPE },
        { name: "组件", value: CLI_COMPONENT_TYPE },
        { name: "npm 工具库", value: CLI_LIBRARY_TYPE },
      ],
    });
    this.currentTemplate = this.templates.filter((template) => {
      return template.type === type.toUpperCase();
    });

    projectInfo = { ...projectInfo, ...this.currentTemplate[0] };

    projectInfo.type = type;

    const title =
      type === CLI_PROJECT_TYPE
        ? "项目"
        : type === CLI_LIBRARY_TYPE
        ? "npm 库"
        : "组件";
    const defaultNamePrompt = [
      {
        type: "input",
        name: "projectName",
        default: this.projectName,
        message: "请输入项目名称",
      },
    ];

    const defaultPrompt = [
      {
        type: "input",
        name: "version",
        default: "1.0.1",
        message: "请输入项目版本号",
      },
      {
        type: "input",
        name: "description",
        default: "天工工程化体系项目模板",
        message: "请输入项目描述",
      },
      {
        type: "list",
        name: "template",
        message: "请选择项目模板",
        choices: this.templates,
      },
    ];

    if (type === CLI_PROJECT_TYPE) {
      // 初始化项目问答
      if (this.projectName) {
        // 项目名称存在，直接使用
        projectInfo.title = this.projectName;

        const askedProjectInfo = await inquirer.prompt(defaultPrompt);

        projectInfo = {
          title,
          ...projectInfo,
          ...askedProjectInfo,
        };
      } else {
        // 项目名称不存在，提示输入
        const projectPromptWithName = defaultNamePrompt.concat(defaultPrompt);

        const askedProjectInfo = await inquirer.prompt(projectPromptWithName);

        projectInfo = {
          ...projectInfo,
          ...askedProjectInfo,
        };
      }
    } else if (type === CLI_LIBRARY_TYPE) {
      // 初始化项目Lib问答
      if (this.projectName) {
        // 项目名称存在，直接使用
        projectInfo.title = this.projectName;

        const askedProjectInfo = await inquirer.prompt(defaultPrompt);

        projectInfo = {
          title,
          ...projectInfo,
          ...askedProjectInfo,
        };
      } else {
        // 项目名称不存在，提示输入
        const projectPromptWithName = defaultNamePrompt.concat(defaultPrompt);

        const askedProjectInfo = await inquirer.prompt(projectPromptWithName);

        projectInfo = {
          ...projectInfo,
          ...askedProjectInfo,
        };
      }
    } else {
    }
    return projectInfo;
  }

  isEmptyDir(localPath) {
    const existedFiles = fs.readdirSync(localPath);
    const filteredFiles = existedFiles.filter((file) => {
      return !file.startsWith(".") || !["node_modules"].includes(file);
    });

    return filteredFiles.length === 0;
  }
}

function init(args) {
  return new InitCommand(args);
}

module.exports = init;
