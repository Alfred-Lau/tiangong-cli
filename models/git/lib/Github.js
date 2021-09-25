const Server = require("./GitServer");

class GithubServer extends Server {
  constructor() {
    super({ type: "github" });
  }
}

module.exports = GithubServer;
