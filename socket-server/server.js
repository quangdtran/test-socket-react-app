
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// our localhost port
const PORT = 8080;

const app = express();

// our server instance
const server = http.createServer(app);

// This creates our socket using the instance of the server
const io = socketIO(server);

let users = [];
let chatBoxs = [];

const deleteUser = (socketId) => {
  users = users.filter(user => user.socketId !== socketId);
};

const updateUserName = (userUpdated) => {
  for (let user of users) {
    if (user.socketId === userUpdated.socketId) {
      user.name = userUpdated.name;
      return;
    }
  }
};

// This is what the socket.io syntax is like, we will work this later
const chatIO = io.of('/chat');
chatIO.on('connection', socket => {
  users.push({
    name: 'no name',
    socketId: socket.id,
  });
  io.of('/chat').to(socket.id).emit('server:send-socket-id', socket.id);
  io.of('/chat').emit('server:get-all-user', users);
  
  socket.on('client:update-user', user => {
    updateUserName(user);
    io.of('/chat').emit('server:get-all-user', users);
  });
  
  socket.on('client:send-message', msg => {
    // console.log(msg)
    io.of('/chat').to(msg.toId).emit('server:send-message', {
      fromSocketId: socket.id,
      content: msg.content,
    });
  });
  
  socket.on('disconnect', () => {
    deleteUser(socket.id);
    io.of('/chat').emit('server:get-all-user', users);
  })
  console.log(socket.id + ' connected');
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));