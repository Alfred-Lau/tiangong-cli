"use strict";

const simpleGit = require("simple-git");
const path = require("path");
const userHome = require("user-home");
const fse = require("fs-extra");
const inquirer = require("inquirer");
const log = require("@tiangongkit/log");
const { readFile, writeFile } = require("@tiangongkit/utils");

const DEFAULT_CLI_HOME = ".tg_cli";
const GIT_SERVER_PATH = ".git";
const GIT_SERVER_FILE = ".git_server";
class Git {
  constructor({ name, version, dir }) {
    this.name = name;
    this.version = version;
    this.dir = dir;
    this.git = simpleGit(dir);
    this.gitServer = null;
  }
  async prepare() {
    //  1. 检查缓存主目录
    this.checkHomePath();
    await this.checkGitServer();
  }

  checkHomePath() {
    if (!this.homePath) {
      if (process.env.CLI_HOME_PATH) {
        this.homePath = process.env.CLI_HOME_PATH;
      } else {
        this.homePath = path.resolve(userHome, DEFAULT_CLI_HOME);
      }
    }
    fse.ensureDirSync(this.homePath);
    if (!fse.existsSync(this.homePath)) {
      throw new Error("用户主目录获取失败");
    }
  }
  async init(options) {
    await this.prepare();
  }

  async checkGitServer() {
    const gitServerPath = this.createPath(GIT_SERVER_FILE);
    const gitServerString = readFile(gitServerPath);
    if (gitServerString) {
      log.info("选择托管的 Git 平台是：", gitServerString);
    } else {
      const selectedGitServer = (
        await inquirer.prompt({
          type: "list",
          name: "selectedGitServer",
          default: "gtihub",
          message: "请选择托管的 Git 平台",
          choices: [
            { key: "github", value: "github" },
            { key: "gitee", value: "gitee" },
          ],
        })
      ).selectedGitServer;
      log.info("", `${selectedGitServer} ---> ${gitServerPath}`);
      writeFile(gitServerPath, selectedGitServer);
    }
  }

  createPath(file) {
    return path.resolve(this.homePath, GIT_SERVER_PATH, file);
  }
}
module.exports = Git;
