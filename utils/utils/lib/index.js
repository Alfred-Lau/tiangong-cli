"use strict";

function isObject(o) {
  if (!o) {
    return false;
  }
  return Object.prototype.toString.call(o) === "object [Object]";
}

module.exports = {
  isObject,
};
