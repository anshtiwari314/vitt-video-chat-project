const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4:uuid4} = require('uuid')


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

        
    })
    socket.on('camera-toggle',(roomId,userId,state)=>{
        console.log(roomId,userId,state)
        socket.to(roomId).emit('user-camera-toggle',userId,state)
    })
    
})

server.listen(5000)