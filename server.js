const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4:uuid4} = require('uuid')
const dotenv = require('dotenv')
const cors = require('cors')

let port = process.env.PORT || 5000

dotenv.config()
app.set("view engine","ejs")
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:'*'
}))

let createdLinks = []

function checkRoomStillExist(roomId){
    for(let i=0; i<createdLinks.length ;i++){
        if(roomId === createdLinks[i].roomId)
            return true;
    }
    return false;
}

function diff_minutes(dt2, dt1) {

  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  let diff_in_min = diff/ 60;
  //let diff_in_hours = diff_in_min / 60;
  return Math.abs(Math.round(diff_in_min));
 }

 function removeExpiredLinks(){
    let d = new Date()
    console.log('expired links triggered')
    createdLinks.forEach((ele,index)=>{
        
        if(diff_minutes(d,ele.date) >60)
            createdLinks.splice(index,1)
        console.log(createdLinks[index],index)
    })
 }

setInterval(()=>removeExpiredLinks(),1000*60)



app.get('/',(req,res)=>{
   // res.redirect(`/${uuid4()}`)
   res.render(`Home`)
})

app.get('/leave',(req,res)=>{
    res.render('leave')
})
app.post('/createRoom',(req,res)=>{
    //console.log(req.headers)
    console.log('the data must need to be here',req.body.roomId)

    let roomId = req.body.roomId
    let d = new Date()
    createdLinks.push({roomId:roomId,date:d})
    res.sendStatus(200)
})
app.post('/checkRoomId',(req,res)=>{
    //console.log(req.body.roomId)
   
  // res.append('access-control-allow-origin','*')
  //res.setHeader('Access-Control-Allow-Origin', '*');
    res.append('Content-Type', 'application/json')

    if(checkRoomStillExist(req.body.roomId))
        res.json(JSON.stringify({authorized:'yes'}))
    else res.json(JSON.stringify({authorized:'no'}))
})

app.post('/checkMultipleRoomId',(req,res)=>{
   let str = req.body.ids
    let resultString =''
   let arr = str.split(' ')
   
   arr.forEach((e,index)=>{
    if(!checkRoomStillExist(req.body.roomId))
        arr.splice(index,1)
   })

   arr.forEach((e,index)=>{
    resultString = `${resultString} ${e}`
   })
   res.sendStatus(200).json({res:resultString})

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
       // console.log(roomId,userId,state)
        socket.to(roomId).emit('user-camera-toggle',userId,state)
    })
    
})

server.listen(port ,()=>console.log(`server started on ${port}`))