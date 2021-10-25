"use strict";
const axios = require("axios").default;

// const baseURL =
//   process.env.LOG_LEVEL === "verbose"
//     ? "http://localhost:3000"
//     : "http://139.129.44.2:8082/";
const baseURL = "https://lazy-minus-your-intelligence.com";

const request = axios.create({
  baseURL,
  timeout: 10000,
});

request.interceptors.response.use(
  (resp) => {
    if (resp.status === 200) {
      return resp.data.data;
    }
  },
  (err) => {
    return Promise.reject(err);
  }
);
module.exports = request;
