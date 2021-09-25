const Server = require("./GitServer");

class GiteeServer extends Server {
  constructor() {
    super({ type: "gitee" });
  }
}

module.exports = GiteeServer;
