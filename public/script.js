const socket = io('/')


let colorArr = ['rgb(146, 146, 145)' ,'rgb(111, 111, 111)', 'rgb(69, 69, 69)' ,'rgb(104, 104, 104)' ,'rgb(103, 97, 97)' ,'rgb(67, 63, 63)']
let userColorArr = [
    {
    background: 'rgb(164, 206, 234)',
    color:'rgb(251, 74, 42)'
    },
    {
    background: 'rgb(166, 164, 234)',
    color:'rgb(4, 144, 214)'
    },
    {
    background:'rgb(255, 223, 193)',
    color:'rgb(83, 73, 151)'
    },
    {
    background: 'rgb(227, 255, 210)',
    color:'rgb(248, 140, 16)'
    },
    {
        color:'rgb(176, 173, 4)',
        background: 'rgb(251, 241, 171)'
    },
    {
    background: 'rgb(252, 193, 193)',
    color: 'rgb(238, 56, 56)'
    }
    
]

fetch('/checkRoomId',{
        method:'POST',
        headers:{
           'Accept':'application.json',
           'Content-Type':'application/json'
        },
        body:JSON.stringify({roomId:ROOM_ID}),
        cache:'default',
       
}).then(res=>{
    // console.log(res.data)
    // if(res.result ==='not-ok' )
    //     window.location.pathname = '/'
    return res.json()
}).then(result=>{
    if(JSON.parse(result).authorized ==='no' )
        window.location.pathname = '/'
    else{
//code is inside 

let myName 
if(sessionStorage.getItem('userName') != null){
    myName = sessionStorage.getItem('userName')
}else{
   
    while(!myName)
    myName = prompt("Please Enter your name")

    sessionStorage.setItem('userName',myName)
}








// basic page working setup 

let vidIcon = document.getElementById('vidIcon');
let crossVidIcon = document.getElementById('crossVidIcon');
let micIcon = document.getElementById('micIcon');
let crossMicIcon = document.getElementById('crossMicIcon');
let msgIcon = document.getElementById('msgIcon');
let usersIcon = document.getElementById('usersIcon');
let crossIcon = document.getElementById('crossIcon');
let closeSideChatIcon = document.getElementById('closeSideChatIcon')
let sendMsgIcon = document.getElementById('sendMsgIcon')

let timeElement = document.getElementById('timeElement')
let sideChat = document.getElementsByClassName('chat')
let layout = document.getElementsByClassName('layout')
let msgInput = document.getElementById('msgInput')

let chatBtn = document.getElementById('chatBtn')
let usrBtn = document.getElementById('usrBtn')

let sideWindowStatus = true
let myStream
let myId =uuidv4()
const peer = new Peer(myId)


vidIcon.addEventListener('click',()=>{

    vidIcon.style.display = 'none'
    crossVidIcon.style.display = 'block'

    toggleVideoOnOff()
})
crossVidIcon.addEventListener('click',()=>{
    vidIcon.style.display = 'block'
    crossVidIcon.style.display = 'none'
    toggleVideoOnOff()
})
micIcon.addEventListener('click',()=>{
    micIcon.style.display = 'none'
    crossMicIcon.style.display = 'block'
    toggleMicOnOff()
})
crossMicIcon.addEventListener('click',()=>{
    micIcon.style.display = 'block'
    crossMicIcon.style.display = 'none'
    toggleMicOnOff()
})
msgIcon.addEventListener('click',()=>{
    let msgWindow = document.getElementById('messages')
    let participantsWindow = document.getElementById('participants')
    let msgFooter = document.getElementById('messages-footer')
    let headerStatus = document.getElementById('header-status')

    msgWindow.style.display = 'block'
    participantsWindow.style.display = 'none'
    msgFooter.style.display = 'flex'
    headerStatus.innerText = 'Group chat'

    if(sideWindowStatus == false){
        sideWindowStatus =true
        openSideWindow()
    }
})
usersIcon.addEventListener('click',()=>{
    let msgWindow = document.getElementById('messages')
    let participantsWindow = document.getElementById('participants')
    let msgFooter = document.getElementById('messages-footer')
    let headerStatus = document.getElementById('header-status')

    msgWindow.style.display = 'none'
    participantsWindow.style.display = 'block'
    msgFooter.style.display = 'none'
    headerStatus.innerText = 'Guests'

    if(sideWindowStatus == false){
        sideWindowStatus =true
        openSideWindow()
    }
})
closeSideChatIcon.addEventListener('click',()=>{
    sideWindowStatus = false 
    closeSideWindow()
})

sendMsgIcon.addEventListener('click',()=>{
    
    if(msgInput.value != ''){
    let msg = msgInput.value
    msgInput.value = ''
    
    addNewMessage(msg,false,'')
    
    socket.emit('send-msg',msg,name)
    }
})
msgInput.addEventListener('keyup',(e)=>{
    if(e.key==='Enter' && msgInput.value != ''){

    let msg = msgInput.value
    msgInput.value = ''
    addNewMessage(msg,false,'')
    socket.emit('send-msg',msg,name)

    }
})
crossIcon.addEventListener('click',()=>{
    console.log('cross icon clicked')
    window.open('', '_self', '');

    window.close()
})

chatBtn.addEventListener('click',()=>{
    chatBtn.classList.add('button-active')
    usrBtn.classList.remove('button-active')


    let msgWindow = document.getElementById('messages')
    let participantsWindow = document.getElementById('participants')
    let msgFooter = document.getElementById('messages-footer')
    let headerStatus = document.getElementById('header-status')

    msgWindow.style.display = 'block'
    participantsWindow.style.display = 'none'
    msgFooter.style.display = 'flex'
    headerStatus.innerText = 'Group chat'

    if(sideWindowStatus == false){
        sideWindowStatus =true
        openSideWindow()
    }

})
usrBtn.addEventListener('click',()=>{
    chatBtn.classList.remove('button-active')
    usrBtn.classList.add('button-active')

    let msgWindow = document.getElementById('messages')
    let participantsWindow = document.getElementById('participants')
    let msgFooter = document.getElementById('messages-footer')
    let headerStatus = document.getElementById('header-status')

    msgWindow.style.display = 'none'
    participantsWindow.style.display = 'block'
    msgFooter.style.display = 'none'
    headerStatus.innerText = 'Guests'

    if(sideWindowStatus == false){
        sideWindowStatus =true
        openSideWindow()
    }

})

function openSideWindow(){
    sideChat[0].style.display = "block"
    layout[0].style.width = "75vw"
}
function closeSideWindow(){
    
    sideChat[0].style.display = "none"
    layout[0].style.width = "100vw"
}

socket.on('receive-msg',(msg,userName)=>{
    addNewMessage(msg,true,userName)
})

socket.on('user-camera-toggle',(userId,state)=>{
    console.log('user-camera-toggle')
    let user = document.getElementById(userId)

    if(user.children[0].children[0].style.display != 'none'){
        user.children[0].children[0].style.display='none'
        user.children[0].children[1].style.display='flex'
        //console.log(user.children[0].children[1].style.display)
    }else{
        user.children[0].children[0].style.display='block'
        user.children[0].children[1].style.display='none'
        //console.log(user.children[0].children[1].style.display)
    }
    
    
})
function addNewMessage(msg,isAnotherUser,userName){
    let scrollable = document.getElementsByClassName('scrollable')[0]

    if(isAnotherUser){
        let incoming = document.createElement('div')
        incoming.classList.add('incoming')
        incoming.innerHTML = `<div class="img-wrapper">
                                    <i class="fa-solid fa-user-large img"></i>
                                    </div>
                                    
                                    <div class="client">
                                    <p class="user">${userName}</p>
                                    <div class="msg"> 
                                        <p>${msg}</p>
                                    </div>
                            </div>`
        scrollable.appendChild(incoming)
    }else{
    let outgoing = document.createElement('div')
    outgoing.classList.add('outgoing')

    outgoing.innerHTML =   `<div class="sender"> 
                                <p class="user">You</p>
                                <div class="msg">
                                    <p>${msg} </p>
                                </div>
                            </div>`
    scrollable.appendChild(outgoing) 
    }
}
function toggleVideoOnOff(){
    
    let user = document.getElementById(myId)
    let videoChild = user.querySelector('video')
    let nameChild = user.querySelector('.name')

    if(videoChild.style.display != 'none'){
        videoChild.style.display='none' //video
        nameChild.style.display='flex' //parent of p
        
    }else{
        videoChild.style.display='block'
        nameChild.style.display='none'
        
    }


    let enabled = myStream.getVideoTracks()[0].enabled
    if(enabled){
        myStream.getVideoTracks()[0].enabled = false;
        socket.emit("camera-toggle",ROOM_ID,myId,false)

        
    } else{
        myStream.getVideoTracks()[0].enabled = true;
        socket.emit("camera-toggle",ROOM_ID,myId,true)
    }
}



function toggleMicOnOff(){
    let enabled = myStream.getAudioTracks()[0].enabled
    if(enabled){
        myStream.getAudioTracks()[0].enabled = false
    } else{
        myStream.getAudioTracks()[0].enabled = true;
    }
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

function zoomOnClick(id){
    // let clickedElement = document.getElementById(id)
    // clickedElement.height = '90vh'
    // clickedElement.width = '75vw'

    let layout= document.getElementsByClassName('layout')[0]
    

    //converting collection to array
    let childrenArr= Array.prototype.slice.call(layout.children,0)

    

    //un zoom
    
    if(document.getElementById(id).getAttribute('zoom') ==='true'){
        childrenArr.forEach(e => {
            
            if(e.id === id){
                let vid= e.getElementsByTagName('video')[0]
                e.setAttribute('zoom','false')
                // vid.style.width = '70vw'
                vid.style.height = '200px'
            }else{
                e.style.display = 'flex'
            }
        });

    }else{
            //zoom
        childrenArr.forEach(e => {
            if(e.id === id){
                // e.height = '90vh'
                // e.width = '75vw'
                let vid= e.getElementsByTagName('video')[0]
                e.setAttribute('zoom','true')
                // vid.style.width = '70vw'
                vid.style.height = '80vh'
            }else{
                e.style.display = 'none'
            }
        });
    }

    
   
    
}
// if(localStorage.getItem('userId')==null){
//     localStorage.setItem('userId',uuidv4())
// }else{
//     userId = uuidv4();
// }
// console.log(`userId is`,userId)

//video setup

let peerArr = []
let peersObj = {}

//console.log(navigator.mediaDevices)

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream=>{
    myStream=stream

    let myVideo = document.createElement('video')
    myVideo.muted = true 
    addVideoStream(myVideo,myId,stream,myName,()=>{})
    let tempObj


    peer.on('call',call=>{
        call.answer(stream)
        console.log('call.peer',call.peer)
        peersObj[call.peer] = call 
        
        call.on('stream',(oldUserVideoStream)=>{
            
            if(!peerArr.includes(call.peer)){
                peerArr.push(call.peer)

                let video = document.createElement('video')
                addVideoStream(video,call.peer,oldUserVideoStream,undefined,()=>{ 
                    changeLogoName(tempObj.name,tempObj.id)
                })
            }
        })
        
        call.on('close',()=>{
            console.log('user leaved ')
           removeVideo(call.peer)
           removeParticipants(call.peer)
        })

    })

    peer.on('connection',(conn)=>{

        conn.on('open', function() {
            // Receive messages
            conn.on('data', (obj)=> {
                console.log('1st receiver',obj,conn.peer)
                tempObj=obj
              
              addParticipants(obj.name,obj.host,conn.peer)
              
            });
            // Send messages
            conn.send({name:myName,host:IS_HOST,id:myId});
          });

        conn.on('close',()=>{
           // console.log('1st remove conn.peer ',conn.peer)
            
        })

     })

     

        

     

     

    socket.on('user-connected',(newUserId)=>{
        console.log('new user ',newUserId)
        connectToNewUser(newUserId,stream)
        
    })
    socket.on('user-disconnected',(userId)=>{
        console.log('disconnect user id',userId)
        if(peersObj[userId]){
            peersObj[userId].close()
        }
    })
})

peer.on('open',myId=>{
    socket.emit('join-room',ROOM_ID,myId,myName)
}) 
function changeLogoName(name,id){
    //console.log(document.getElementById(id).querySelector('p'))
   document.getElementById(id).querySelector('p').innerText = name.toUpperCase().substring(0,2);
    
}
function removeParticipants(id){
    let element = document.getElementsByClassName(id)[0]
    element.remove()
}
function addParticipants(name,host,id){
    console.log(host,id,host=== true ?'block':'none')
    let participants  =  document.getElementById('participants')
    let div = document.createElement('div')
    div.classList.add('user')
    div.classList.add(id)
    
    div.innerHTML = `<div class="icon">
                        <div>
                            <p>AT</p>
                        </div>
                    </div>
                    <div class="name">
                        <p >${name}</p>
                        <p class="host" style="display=${host=== true ?'block':'none'}">Meeting host</p>
                    </div>
                    <div class="pins">
                        <i class="fa-solid fa-thumbtack pin"></i>
                    </div>`
    
    participants.appendChild(div)                 
                    
}

function connectToNewUser(newUserId,stream){
    //i m calling
    const call = peer.call(newUserId,stream)
    let tempObj
    // i am receiving
    call.on('stream',userVideoStream =>{
        if(!peerArr.includes(call.peer)){
            peerArr.push(call.peer)
            let video = document.createElement('video')
            addVideoStream(video,call.peer,userVideoStream,undefined,()=>{
                changeLogoName(tempObj.name,tempObj.id)
            })
        }
    })

    call.on('close',()=>{
        console.log('user leaved ')
       removeVideo(newUserId)
       removeParticipants(newUserId)
    })
    peersObj[newUserId] =call



        //for data connection 
        const conn = peer.connect(newUserId)
            
        conn.on('open', function() {
            // Receive messages
            conn.on('data', (obj)=> {
                //console.log('2nd receiver',obj)
                tempObj=obj

                addParticipants(obj.name,obj.host,newUserId)
                
            });

            // Send messages
            conn.send({name:myName,host:IS_HOST,id:myId});
        });

        conn.on('close',()=>{
            console.log('2nd remove ',newUserId)
            
        })


}

function removeVideo(id){
   let usrWrapper = document.getElementById(id)
   usrWrapper.remove()
}
function addVideoStream(video,id,stream,name='NA',cb){
    let layout = document.getElementById('layout')

    let usrWrapper = document.createElement('div')
    let usr = document.createElement('div')
    
    let nameDiv = document.createElement('div')
    let p = document.createElement('p')
    
    usrWrapper.classList.add('user-wrapper')
    usrWrapper.id = id
    usr.classList.add('user')
    nameDiv.classList.add('name')
    p.innerText = name.toUpperCase().substring(0,2);

    nameDiv.style.display = 'none'
    usrWrapper.style.backgroundColor =colorArr[Math.floor(Math.random()*colorArr.length)]
    usrWrapper.setAttribute('zoom','false')

    //video.style.height = "200px"
    video.srcObject = stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    })

    usr.appendChild(video)
    nameDiv.appendChild(p)
    usr.appendChild(nameDiv)
    usrWrapper.appendChild(usr)

    usrWrapper.addEventListener('click',()=>zoomOnClick(id))
    layout.appendChild(usrWrapper)
   // console.log(VideoGrid) 
  // VideoGrid.append(video)

  setTimeout(()=>cb(),1000)
}


//setting timer
function timer(hour,min,sec,d){
    let date2= new Date()
    var diff = date2.getTime() - d.getTime();

    var msec = diff;
    var hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    var mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    var ss = Math.floor(msec / 1000);
    msec -= ss * 1000;

    if(hh<=0)
    timeElement.innerText = `${mm}:${ss}`
    else 
    timeElement.innerText = `${hh}:${mm}:${ss}`


}

    //code for timer
    let d = new Date()
    setInterval(()=>{
        timer(d.getHours(),d.getMinutes(),d.getSeconds(),d)
    },1000)
    


//code to send record data

navigator.mediaDevices.getUserMedia({
    video:false,
    audio:true
}).then(audioStream=>{
    
    let audioChunks = []
   
    function sendToServer(blob){
        let reader = new FileReader();
        reader.onloadend = ()=>{
            let base64data = reader.result;
            //console.log(base64data.split(',')[1])
            //https://f6p70odi12.execute-api.ap-south-1.amazonaws.com
            //http://localhost:5000/checkRoomId
            fetch('https://f6p70odi12.execute-api.ap-south-1.amazonaws.com',{
                method:'POST',
                headers:{
                   'Accept':'application.json',
                   'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    audiomessage:base64data.split(',')[1],
                    uid:'random-just-for-test'
                }),
                cache:'default',}).then(res=>console.log(res))

        }

        reader.readAsDataURL(blob)
    }

    function recordAudio(stream){
        console.log(`record audio triggerd`)
        let mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (e)=> audioChunks.push(e.data);
        mediaRecorder.onstop = ()=>{sendToServer(new Blob(audioChunks,{'type':'audio/wav'}));chunks = [] };
        setTimeout(()=>{ mediaRecorder.stop()},2000)
        mediaRecorder.start()

    }
  //  setInterval(()=>recordAudio(audioStream),2000)
})


// remaining code of fetch request
}
}).catch(e=>console.log(e))