const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4:uuid4} = require('uuid')
const dotenv = require('dotenv')
let port = process.env.PORT || 5000

dotenv.config()
app.set("view engine","ejs")
app.use(express.static('public'))

app.get('/',(req,res)=>{
    res.redirect(`/${uuid4()}`)
})

app.get('/:room',(req,res)=>{
   // console.log(req.params.room)
    res.render('index',{roomId:req.params.room})
})

io.on('connection',socket =>{

    socket.on('join-room',(roomId,userId)=>{

        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected',userId)
        console.log(roomId,userId)

        socket.on('disconnect', () =>{
            console.log('someone disconnect',userId)
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
         })

        socket.on('send-msg',(msg,userName)=>{
            socket.broadcast.to(roomId).emit('receive-msg', msg,userName);
        })
    })
    socket.on('camera-toggle',(roomId,userId,state)=>{
        console.log(roomId,userId,state)
        socket.to(roomId).emit('user-camera-toggle',userId,state)
    })
    
})

server.listen(port ,()=>console.log(`server started on ${port}`))