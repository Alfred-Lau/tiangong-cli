"use strict";

module.exports = { getNpmInfo };

const axios = require("axios");
const urlJoin = require("url-join");

/**
 *获取 npm 远程包信息
 *
 * @param {*} name npm 包名称
 * @param {*} registry 允许自定义repo
 */
function getNpmInfo(name, registry) {
  if (!name) {
    return null;
  }

  let registryUrl = registry || getDefaultRegistry();
  const url = urlJoin(registryUrl, name);

  return axios
    .get(url)
    .then((resp) => {
      if (resp.status === 200) {
        return resp.data;
      }
      return null;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

function getDefaultRegistry(isOrigin = false) {
  return isOrigin
    ? '"http://registry.npmjs.org/"'
    : "http://registry.npm.taobao.org/";
}
