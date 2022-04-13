const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/user')


const app = express();
const server = http.createServer(app);//nếu bth k làm bước này thì nó cũng đã làm ngầm định
                                    // mình chỉ biết ra để mình có dc th server để làm việc với socket.io giao tiếp với client
const io = socketio(server)

const port = process.env.PORT || 3000;

const publicDirectory = path.join(__dirname, '../public')

app.use(express.static(publicDirectory))

// let count = 0;
let message = '';
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    //socket.emit('message',generateMessage('Welcome!'))
    //socket.broadcast.emit('message',generateMessage('A new user has joined!'))//tất cả trừ client đó thưc hiện on message
    
    socket.on('join',({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)//chỉ 
        // io.to.emit, socket.broadcast.to.emit: dùng để emit tới chỉ nh người trong room
        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(room).emit('message',generateMessage('Admin',`${user.username} has joined`))//tất cả trừ client đó thưc hiện on message

        //
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        console.log('why')
        callback()
    })
    
    socket.on('sendMessage', (messageSent,callback) =>{
        // console.log(messageSent)
        const user = getUser(socket.id)
        if(!user) {
            return callback('User not found')
        }
        const filter = new Filter()

        if(filter.isProfane(messageSent)){
            return callback('Profanity is not allowed')
        }
        // console.log(user.room)
        io.to(user.room).emit('message',generateMessage(user.username,messageSent))//mỗi khi 1 người gửi tin nhắn thì tất cả mọi người đều thực hiện in ra bên client
        callback()//acknowledgement that the message from client deliverd to server successfully
    })

    socket.on('sendLocation',(coords,callback) => {
        // console.log(latitude)
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.longitude},${coords.latitude}`))
        callback()
    })
    
    socket.on('disconnect',() => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
            //Chỉ emit message rời phòng cho phòng của user đó và nếu như user đó nằm trong userlist
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})//run for each new connection

server.listen(port, () => {
    console.log('Server is up on port '+ port)
})
