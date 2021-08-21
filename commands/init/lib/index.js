"use strict";
const log = require("@tiangongkit/log");
const Command = require("@tiangongkit/command");
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

  async prepare() {
    // 检查模板是否存在
    const localPath = process.cwd();
    if (this.isEmptyDir(localPath)) {
      const answer = await inquirer.prompt({
        type: "question",
        name: "projectName",
      });
      console.log(answer);
    }
  }

  isEmptyDir(localPath) {
    const existedFiles = fs.readdirSync(localPath)
    const filteredFiles = existedFiles.filter(file=>{
      return !file.startsWith('.') || !['node_modules'].includes(file)
    })
    console.log('filteredFiles',filteredFiles)

    return filteredFiles.length === 0
  }
}

function init(args) {
  return new InitCommand(args);
}

module.exports = init;
