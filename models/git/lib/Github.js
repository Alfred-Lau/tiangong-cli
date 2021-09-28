const log = require("@tiangongkit/log");
const Server = require("./GitServer");
const GithubRequest = require("./GithubRequest");

class GithubServer extends Server {
  constructor() {
    super({ type: "github" });
    this.request = null;
  }

  setToken(token) {
    this.token = token;
    this.request = new GithubRequest(token);
  }

  outputTokenHelp() {
    return "https://github.com/settings/tokens";
  }

  async getUser() {
    let user;
    try {
      user = await this.request.get("/user");
      log.info("", user);
    } catch (error) {
      log.error("", error.message);
    }
    return user;
  }

  async getOrg() {
    let org;
    try {
      org = await this.request.get(`/user/orgs`);
    } catch (error) {
      log.error("", error.message);
    }
    return org;
  }

  async getRepo(login, name) {}
}

module.exports = GithubServer;
