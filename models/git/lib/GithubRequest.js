const axios = require("axios");

const BASE_URL = "https://api.github.com";

class GithubRequest {
  constructor(token) {
    this.token = token;
    this.request = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    });

    this.request.interceptors.request.use(
      (config) => {
        config.headers["Authorization"] = `token ${this.token}`;
        return config;
      },
      (err) => Promise.reject(err)
    );

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

module.exports = GithubRequest;
