"use strict";

const io = require("socket.io-client");

const BUILD_START = "build_start";

class CloudBuild {
  constructor(config) {
    this.options = config;
    this.socket = this.createSocket();
  }

  createSocket() {
    const socket = io("http://127.0.0.1:7001");

    socket.on("connect", () => {
      console.log("connect!");
      socket.emit("chat", "hello world!");
    });

    socket.on(BUILD_START, (msg) => {
      console.log("res from server: %s!", msg);
    });

    return socket;
  }

  sendMessage(msg) {
    console.log(msg);
    this.socket.emit("chat", msg);
  }

  prepare() {}
}
module.exports = CloudBuild;
