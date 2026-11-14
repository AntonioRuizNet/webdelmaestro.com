"use strict";
// Local readiness only: no HTTP actions, credentials or application data.
const net = require("node:net");
const hostname = process.env.HOSTNAME;
const host = !hostname || hostname === "0.0.0.0" ? "127.0.0.1" : hostname;
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) process.exit(1);
const socket = net.connect({ host, port }, () => { socket.end(); process.exit(0); });
socket.once("error", () => process.exit(1));
socket.setTimeout(3000, () => { socket.destroy(); process.exit(1); });
