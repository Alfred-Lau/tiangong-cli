"use strict";
const axios = require("axios").default;

const baseURL =
  process.env.LOG_LEVEL === "verbose"
    ? "http://localhost:3000"
    : "http://139.129.44.2:8082/";

const request = axios.create({
  baseURL,
  timeout: 3000,
});

request.interceptors.response.use(
  (resp) => {
    if (resp.status === 200) {
      return resp.data.data;
    }
  },
  (err) => {
    err;
  }
);
module.exports = request;
