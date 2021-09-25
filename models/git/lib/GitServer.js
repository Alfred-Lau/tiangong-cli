const invariant = require("invariant");

function handleError(err) {
  throw new Error(err);
}

/**
 *git server 的基类
 *
 * @class GitServer
 */
class GitServer {
  constructor({ type, token }) {
    this.type = type;
    this.token = token;
  }

  setToken() {
    invariant(true, "setToken 方法必须在子类中必须有自己的实现");
  }
}

module.exports = GitServer;
