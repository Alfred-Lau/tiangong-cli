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
    invariant(false, "setToken 方法必须在子类中必须有自己的实现");
  }

  isHttpResponse(resp) {
    return resp && resp.status;
  }

  /**
   *处理接口返回值
   *
   * @param {*} resp
   * @memberof GitServer
   */
  handleResponse(resp) {
    if (!this.isHttpResponse(resp)) {
      return null;
    } else {
      return resp;
    }
  }

  /**
   * 获取用户信息
   *
   * @memberof GitServer
   */
  async getUser() {
    invariant(false, "getUser 方法必须在子类中必须有自己的实现");
  }
  /**
   *获取用户所属组织信息
   *
   * @memberof GitServer
   */
  async getOrg() {
    invariant(false, "getOrg 方法必须在子类中必须有自己的实现");
  }

  async getRepo() {
    invariant(false, "getRepo 方法必须在子类中必须有自己的实现");
  }

  outputTokenHelp() {
    invariant(false, "outputTokenHelp 方法必须在子类中必须有自己的实现");
  }

  getRemote() {
    invariant(false, "getRemote 方法必须在子类中必须有自己的实现");
  }
}

module.exports = GitServer;
