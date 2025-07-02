const express = require('express');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);

const authToken = require('./auth');

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if(!token) return next(new Error("Token is required."));
  const isAuthent = authToken(token);
  if(!isAuthent) return next(new Error("Authentication error!"))
  socket.user = isAuthent;
  next();
})

let onlineUsers = new Map();

io.on('connection', (socket) => {

  console.log(`User connected: ${socket.user.userEmail}`);

  onlineUsers.set(socket.user.userId, socket.id);
  io.emit('presence:update', Array.from(onlineUsers.keys()));

  socket.on('add-to-group', ({userList, groupId}) => {
    if(userList.length > 0) {
      userList.forEach((user) => {
        const socketId = onlineUsers.get(user);
        if(socketId) {
          io.in(socketId).socketsJoin(groupId)
          console.log(`User ${socketId} joined group ${groupId}.`);
        }
      })
    }
  })

  socket.on('delete-from-group', ({userList, groupId}) => {
    if(userList.length > 0) {
      userList.forEach((user) => {
        const socketId = onlineUsers.get(user);
        if(socketId) {
          io.in(socketId).socketsLeave(groupId)
          console.log(`User ${socketId} leave group ${groupId}.`);
        }
      })
    }
  })

  socket.on('join-group', ({groupList}) => {
    if(groupList.length > 0) {
      groupList.forEach((groupId) => {
        socket.join(groupId);
        console.log(`User ${socket.id} joined group ${groupId}.`);
      })
    }
  })

  socket.on('leave-group', ({groupList}) => {
    if(groupList.length > 0) {
      groupList.forEach((groupId) => {
        socket.leave(groupId);
        console.log(`User ${socket.id} leave group ${groupId}.`);
      })
    }
  })

  socket.on('send_message', ({type, from, to, groupId, content, imageUrl, createAt}) => {
    const message = {type, from, to, groupId, content, imageUrl, createAt };

    if(type === 'direct') {
      const receiverSocketId = onlineUsers.get(to._id);
      if(receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);
      }
    } else if (type === 'group') {
      socket.to(groupId._id).emit('receive_message', message);
    }
  });

  socket.on('typing', ({userId, partnerId}) => {
    const receiverSocketId = onlineUsers.get(partnerId);
    io.to(receiverSocketId).emit('is_typing', userId);
  })

  socket.on('stop_typing', ({userId, partnerId}) => {
    const receiverSocketId = onlineUsers.get(partnerId);
    io.to(receiverSocketId).emit('is_stop_typing', userId);
  })

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        break;
      }
    }
    io.emit('presence:update', Array.from(onlineUsers.keys()));
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`chat-server running on port ${PORT}`);
});
