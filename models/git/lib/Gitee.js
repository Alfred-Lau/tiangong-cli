const Server = require("./GitServer");

class GiteeServer extends Server {
  constructor() {
    super({ type: "gitee" });
  }

  setToken(token) {
    this.token = token;
  }

  outputTokenHelp() {
    return "https://gitee.com/";
  }
}

module.exports = GiteeServer;
