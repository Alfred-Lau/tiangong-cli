"use strict";

const simpleGit = require("simple-git");
const path = require("path");
const userHome = require("user-home");
const fse = require("fs-extra");
const inquirer = require("inquirer");
const terminalLink = require("terminal-link");
const log = require("@tiangongkit/log");
const { readFile, writeFile, spinnerStart } = require("@tiangongkit/utils");
const GithubServer = require("./Github");
const GiteeServer = require("./Gitee");

const DEFAULT_CLI_HOME = ".tg_cli";
const GIT_SERVER_PATH = ".git";
const GIT_SERVER_FILE = ".git_server";
const GIT_TOKEN_FILE = ".git_token";
const GIT_OWN_FILE = ".git_own";
const GIT_LOGIN_FILE = ".git_login";
const GIT_IGNORE_FILE = ".gitignore";
const REPO_OWNER_USER = "user";
const REPO_OWNER_ORG = "org";

const GIT_OWNER_TYPE = [
  {
    name: "个人",
    value: REPO_OWNER_USER,
  },
  {
    name: "组织",
    value: REPO_OWNER_ORG,
  },
];

const GIT_OWNER_TYPE_ONLY = [
  {
    name: "个人",
    value: REPO_OWNER_USER,
  },
];

class Git {
  constructor(
    { name, version, dir },
    { refreshServer, refreshToken, refreshOwner }
  ) {
    this.name = name;
    this.version = version;
    this.dir = dir;
    this.git = simpleGit(dir);
    this.gitServer = null;
    this.user = null;
    this.orgs = null;
    this.owner = null; // 远程仓库类型
    this.login = null; //远程仓库登录名
    this.repo = null; // 远程仓库
    // 配置选项
    this.refreshServer = refreshServer;
    this.refreshToken = refreshToken;
    this.refreshOwner = refreshOwner;
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

  /**
   *查询用户和组织信息
   *
   * @memberof Git
   */
  async getUserAndOrg() {
    try {
      this.user = await this.gitServer.getUser();
      if (!this.user) {
        throw new Error("用户信息获取失败");
      }
      const { login: username } = this.user;
      this.orgs = await this.gitServer.getOrg(username);
      if (!this.orgs) {
        throw new Error("用户组织信息获取失败");
      }
    } catch (error) {
      log.error("", error.message);
    }
  }

  /**
   *查询登录角色和登录用户
   *
   * @memberof Git
   */
  async checkGitOwner() {
    // 获取 owner 和 login 登录用户
    const ownerPath = this.createPath(GIT_OWN_FILE);
    const loginPath = this.createPath(GIT_LOGIN_FILE);
    let owner = readFile(ownerPath);
    let login = readFile(loginPath);
    if (!owner || !login || this.refreshOwner) {
      owner = (
        await inquirer.prompt({
          type: "list",
          name: "owner",
          message: "请选择远程仓库类型",
          default: REPO_OWNER_USER,
          choices: this.orgs.length > 0 ? GIT_OWNER_TYPE : GIT_OWNER_TYPE_ONLY,
        })
      ).owner;
      if (owner === REPO_OWNER_USER) {
        login = this.user.login;
      } else {
        login = (
          await inquirer.prompt({
            type: "list",
            name: "login",
            message: "请选择",
            choices: this.orgs.map((item) => ({
              name: item.login,
              value: item.login,
            })),
          })
        ).login;
      }
      writeFile(ownerPath, owner);
      writeFile(loginPath, login);
      log.success("owner写入成功", `${owner} -> ${ownerPath}`);
      log.success("login写入成功", `${login} -> ${loginPath}`);
    } else {
      log.success("owner获取成功", owner);
      log.success("login获取成功", login);
    }
    this.owner = owner;
    this.login = login;
  }

  /**
   *创建和获取远程仓库
   *
   * @memberof Git
   */
  async checkRepo() {
    let repo = await this.gitServer.getRepo(this.login, this.name);

    if (!repo) {
      // repo 远程项目不存在，开始创建项目
      const spinner = spinnerStart("开始创建远程仓库");

      try {
        if (this.owner === REPO_OWNER_USER) {
          // 创建个人项目
          repo = await this.gitServer.createRepo(this.name);
        } else {
          // 创建组织内项目
          this.gitServer.createOrgRepo(this.name, this.login);
        }
      } catch (error) {
        log.error(error);
        throw new Error("远程仓库创建失败");
      } finally {
        spinner.stop(true);
      }

      if (repo) {
        log.success("远程仓库创建成功");
      }
    } else {
      log.success("远程仓库信息获取成功");
    }
    log.verbose("", repo);
    this.repo = repo;
  }

  /**
   *检查并创建 gitignore 文件
   *
   * @memberof Git
   */
  checkAndCreateGitIgnoreFile() {
    const gitIgnoreFile = path.resolve(this.dir, GIT_IGNORE_FILE);
    if (!fse.existsSync(gitIgnoreFile)) {
      writeFile(
        gitIgnoreFile,
        `
      .DS_Store
node_modules
/dist


# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
      `
      );
      log.success(`自动写入 ${gitIgnoreFile} 成功`);
    }
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
      // 7. 检查并创建 gitignore 文件
      this.checkAndCreateGitIgnoreFile();
    } catch (error) {
      log.error("", error.message);
    }
  }

  async init(options) {
    await this.prepare(options);
  }
}
module.exports = Git;
