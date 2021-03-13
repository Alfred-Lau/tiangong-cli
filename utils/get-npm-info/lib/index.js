"use strict";

module.exports = { getNpmInfo, getSemverVersions, getLatestVersion };

const axios = require("axios");
const urlJoin = require("url-join");
const semver = require("semver");

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

/**
 *获取最近的满足条件的版本
 *
 * @param {*} npmName
 * @param {*} currentVersion
 * @param {*} registry
 */
async function getSemverVersions(npmName, currentVersion, registry) {
  const info = await getNpmInfo(npmName, registry);
  try {
    if (info) {
      return (
        Object.keys(info.versions)
          // 直接写 运算符号
          .filter((version) => semver.satisfies(version, `>${currentVersion}`))
          .sort((a, b) => semver.gt(b, a))
      );
    }
  } catch (error) {
    return [];
  }
}

async function getLatestVersion(npmName, currentVersion, registry) {
  const semverVersions = await getSemverVersions(
    npmName,
    currentVersion,
    registry
  );
  if (semverVersions && semverVersions.length) {
    return semverVersions[0];
  }
  return null;
}
