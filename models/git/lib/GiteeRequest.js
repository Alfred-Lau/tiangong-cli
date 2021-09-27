const axios = require("axios");

const BASE_URL = "https://gitee.com/api/v5";

class GiteeRequest {
  constructor(token) {
    this.token = token;
    this.request = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    });

    this.request.interceptors.response.use(
      (resp) => resp.data,
      (err) => {
        if (err.response && err.response.data) {
          return err.response;
        } else {
          return Promise.reject(err);
        }
      }
    );
  }

  get(url, params, headers) {
    return this.request({
      url,
      params: { ...params, access_token: this.token },
      method: "get",
      headers,
    });
  }
}

module.exports = GiteeRequest;
