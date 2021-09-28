const log = require("@tiangongkit/log");
const Server = require("./GitServer");
const GiteeRequest = require("./GiteeRequest");

class GiteeServer extends Server {
  constructor() {
    super({ type: "gitee" });
    this.request = null;
  }

  setToken(token) {
    this.token = token;
    this.request = new GiteeRequest(token);
  }

  outputTokenHelp() {
    return "https://gitee.com/profile/personal_access_tokens";
  }

  async getUser() {
    let user;
    try {
      user = await this.request.get("/user");
    } catch (error) {
      log.error("", error.message);
    }
    return user;
  }
  async getOrg(username) {
    let org;
    try {
      org = await this.request.get(`/users/${username}/orgs`);
    } catch (error) {
      log.error("", error.message);
    }
    return org;
  }

  async getRepo(login, name) {}
}

module.exports = GiteeServer;
