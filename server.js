const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const PORT = process.env.PORT || 5000;

const routes = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", function (socket) {
  console.log("We have a new connection");
  socket.on("disconnect", function () {
    console.log("User has left!");
  });
});

app.use("/", routes);

server.listen(PORT, function () {
  console.log("Server is started at port " + PORT);
});
