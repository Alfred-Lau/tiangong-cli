const Server = require("./GitServer");

class GithubServer extends Server {
  constructor() {
    super({ type: "github" });
  }

  setToken(token) {
    this.token = token;
  }

  outputTokenHelp() {
    return "https://gitee.com/";
  }
}

module.exports = GithubServer;
