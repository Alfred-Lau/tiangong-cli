"use strict";

class Git {
  constructor() {
    console.log("git constructor");
  }
  init(options) {
    console.log("git init", options);
  }
}
module.exports = Git;
