const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

const routes = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());

io.on("connection", function (socket) {
  // console.log("We have a new connection");
  socket.on("join", function ({ name, room }, callback) {
    // console.log(name, room);
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) {
      return callback(error);
    }

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name}, has joined!` });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", { user: user.name, text: message });
      io.to(user.room).emit("roomData", {
        user: user.name,
        users: getUsersInRoom(user.room),
      });
    }
    callback();
  });

  socket.on("disconnect", function () {
    // console.log("User has left!");
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left.`,
      });
    }
  });
});

app.use("/", routes);

server.listen(PORT, function () {
  console.log("Server is started at port " + PORT);
});
