const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors=require("cors")

app.use(cors());
const PORT =process.env.PORT || 3000;
const path = require('path');

const publicPath = path.join("../client/build");
app.use(express.static(publicPath));


const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');



http.listen(PORT,()=> console.log("server is connected"))

io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if(error) return (error);

    socket.join(user.room);

    socket.emit('message', 
    { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message',{ user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData',{ room: user.room, users: getUsersInRoom(user.room) });

  });

  socket.on('sendMessage', (message) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })
});


  



  