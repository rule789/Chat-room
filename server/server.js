const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message.js');
const {isRealString} = require('./utils/validation.js');
const {Users} = require('./utils/user.js');
// add remove get getList user

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

var users = new Users();

// 連線
io.on('connection', (socket) => {
  console.log('New user connected');

  // 加入/創立聊天室
  socket.on('join', (params, callback) => {
    // validate data
    if(!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room are required.');
    }

    // 加進params.room這個聊天室 刪掉任何之前可能待的room 在加進新的聊天室 更新成員名單
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));

    // 管理員訊息
    socket.emit('newMessage', generateMessage('Admin', "Welcome to the chat app"));
    // 對其他人廣播
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
    callback();
  });


  // 傳訊息
  socket.on('createMessage', (message, callback) => {
    // console.log('New Message!', message);
    var user = users.getUser(socket.id);

    if(user && isRealString(message.text)) {
      // 發送事件給所有單一連結
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback(); //送回前端
  });


  // 分享位置資訊 先抓user
  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if(user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  // 用戶端下線
  // 更新名單 顯示下線人
  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
});


server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});



