const express = require('express')
const path = require('path');
const http = require('http');
const app = express()
const socketio = require('socket.io');
var Filter = require('bad-words')
const {generateMessage, generteLocationMessages } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/user');
//create a server using http protocal
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3001
const publicDirectoryPath = path.join(__dirname, '../public')
// console.log('publicDirectoryPath',publicDirectoryPath)
// console.log('__dirname',__filename)
app.use(express.static(publicDirectoryPath))

// let count = 0

// server send (emit) event  -> client receive (on) event - acknowleadge to the server back /countUpdate
// client send (emit)  -> server receive (on) - acknowleadge to the client back /increment

//  socket in an objedt that contains information about that new connection
io.on('connection', (socket) => {
  console.log('New websocket connected')

  // socket.emit('countUpdated', count)

  // socket.on('increment', () => {
  //   count++
  //   // socket.emit it send data(emit) to specific connection
  //   // socket.emit('countUpdated', count)
  //   // io.emit it send data to all the connted user
  //   io.emit('countUpdated', count)
  // })


  // socket.emit //current socket
  // io.emit // send to all socket
  // socket.broadcast.emit // send to all but not for currect socket
  // io.to.emit // send msg to all socket in that particular room
  // socket.broadcast.to.emit // send msg to all but not for currect socket



  socket.on('join',({username, room}, next)=>{

    const { error, user} = addUser({ id: socket.id, username, room})
    if(error){
      return next(error)
    }
    socket.join(user.room)
    socket.emit('message',generateMessage('Admin','welcome'))
  // emit the message to all socket except the current socket
  socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${username} joined to the room`))
  io.to(user.room).emit('roomData',{
    room: user.room,
    users: getUsersInRoom(user.room)
  })

  console.log('getUsersInRoom',getUsersInRoom(user.room))

  next()

  })


  socket.on('sendMessage', (msg, callback) => {
    debugger
    const user = getUser(socket.id)
    console.log('user',user)
    const filter = new Filter()

    if (filter.isProfane(msg)) {
        return callback('Profanity is not allowed!')
    }
    console.log('generateMessage',generateMessage(user.username , msg ));
    io.to(user.room).emit('message', generateMessage(user.username , msg ))
    callback()
})



  socket.on('disconnect', () => {
    const user =  removeUser(socket.id)
    if(user){
    io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }
  })


  socket.on('sendlocation',(lat, lan, next)=>{
    const user =  getUser(socket.id)
    io.to(user.room).emit('locationRender', generteLocationMessages(user.username,`https://www.google.com/maps?q=${lat},${lan}`))
    next()

    // io.emit('message', '<a href=https://www.google.com/maps?q='+`${lat},${lan}`+'>Shared Location</a>')

  })
})

server.listen(port, () => {
  console.log(`server is up on the port ${port}`)
})
