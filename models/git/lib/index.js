"use strict";

const simpleGit = require("simple-git");
const path = require("path");
const userHome = require("user-home");
const fse = require("fs-extra");
const inquirer = require("inquirer");
const terminalLink = require("terminal-link");
const log = require("@tiangongkit/log");
const { readFile, writeFile } = require("@tiangongkit/utils");
const GithubServer = require("./Github");
const GiteeServer = require("./Gitee");

const DEFAULT_CLI_HOME = ".tg_cli";
const GIT_SERVER_PATH = ".git";
const GIT_SERVER_FILE = ".git_server";
const GIT_TOKEN_FILE = ".git_token";
class Git {
  constructor({ name, version, dir }, { refreshServer, refreshToken }) {
    this.name = name;
    this.version = version;
    this.dir = dir;
    this.git = simpleGit(dir);
    this.gitServer = null;
    this.user = null;
    this.org = null;
    // 配置选项
    this.refreshServer = refreshServer;
    this.refreshToken = refreshToken;
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

  createPath(file) {
    return path.resolve(this.homePath, GIT_SERVER_PATH, file);
  }

  async checkGitServer(options) {
    const gitServerPath = this.createPath(GIT_SERVER_FILE);
    const gitServerString = readFile(gitServerPath);

    log.info("", gitServerPath);

    if (!gitServerString || this.refreshServer) {
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
      this.gitServerString = selectedGitServer;
      writeFile(gitServerPath, selectedGitServer);
    } else {
      this.gitServerString = gitServerString;
      log.info("选择托管的 Git 平台是：", gitServerString);
    }
  }

  createGitServer(server) {
    let gitserver = undefined;
    switch (server) {
      case "github":
        gitserver = new GithubServer(server);
        break;
      case "gitee":
        gitserver = new GiteeServer(server);
        break;
      default:
        throw new Error("请选择合适的 git 发布平台");
    }

    return gitserver;
  }

  /**
   *检查 token 是否存在
   *
   * @param {*} optiosn
   * @memberof Git
   */
  async checkServerToken(optiosn) {
    const gitServerTokenPath = this.createPath(GIT_TOKEN_FILE);
    const gitToken = readFile(gitServerTokenPath);

    log.info("", gitServerTokenPath);

    if (!gitToken || this.refreshToken) {
      log.warn(
        "",
        `如何生成 token 参考 ${terminalLink(
          "链接",
          this.gitServer.outputTokenHelp()
        )}`
      );
      const token = (
        await inquirer.prompt({
          type: "password",
          name: "token",
          message: `请输入对应平台的 token 方便后续使用`,
        })
      ).token;
      log.info("token 的查看路径是：", gitServerTokenPath);
      this.token = token;
      writeFile(gitServerTokenPath, token);
    } else {
      this.token = gitToken;
      log.info("token 的查看路径是：", gitServerTokenPath);
    }

    // 向 gitserver 挂载 token
    this.gitServer.setToken(this.token);
  }

  async getUserAndOrg() {
    try {
      this.user = await this.gitServer.getUser();
      if (!this.user) {
        throw new Error("用户信息获取失败");
      }
      const { login: username } = this.user;
      this.org = await this.gitServer.getOrg(username);
      if (!this.org) {
        throw new Error("用户组织信息获取失败");
      }
    } catch (error) {
      log.error("", error.message);
    }
  }

  async checkGitOwner() {
    // 获取 owner 和 login 登录用户
  }

  async checkRepo() {
    let repo = await this.gitServer.getRepo();
  }

  async prepare(options) {
    try {
      //  1. 检查缓存主目录

      this.checkHomePath();
      // 2. gitserver 相关逻辑
      await this.checkGitServer(options);
      this.gitServer = this.createGitServer(this.gitServerString);
      // 3. token 相关逻辑
      await this.checkServerToken(options);
      //  4. 获取用户和组织信息
      await this.getUserAndOrg();
      //  5. 确认用户类型【如果是组织，就需要选择具体组织登录用户】
      await this.checkGitOwner();
      // 6. 检查并创建远程仓库
      await this.checkRepo();
    } catch (error) {
      log.error("", error.message);
    }
  }

  async init(options) {
    await this.prepare(options);
  }
}
module.exports = Git;
