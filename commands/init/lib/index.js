"use strict";
const log = require("@tiangongkit/log");
const Command = require("@tiangongkit/command");
const request = require("@tiangongkit/request");
const { CLI_COMPONENT_TYPE, CLI_PROJECT_TYPE } = require("@tiangongkit/shared");
const inquirer = require("inquirer");
const fs = require("fs");
const fse = require("fs-extra");

class InitCommand extends Command {
  init() {
    // 开始初始化
    this.projectName = this._argv[0] || "";
    this.force = !!this._argv[1].force;
  }

  async exec() {
    try {
      //  1. 进行执行前准备
      await this.prepare();
    } catch (e) {
      log.error("", e.message);
    }
  }

  /**
   * 获取项目模板列表
   *
   * @memberof InitCommand
   */
  async getProjectTemplates() {
    const templates = await request("/api/cli/template/list");
    log.verbose("templates", templates);
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
      ],
    });

    projectInfo.type = type;

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
