const socket = io('/')



let colorArr = ['rgb(146, 146, 145)' ,'rgb(111, 111, 111)', 'rgb(69, 69, 69)' ,'rgb(104, 104, 104)' ,'rgb(103, 97, 97)' ,'rgb(67, 63, 63)']


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


let sideWindowStatus = true
let myStream
let myId =uuidv4()
const peer = new Peer(myId)
let name ="Ayush"

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
      
    if(sideWindowStatus == true){
        sideWindowStatus =false 
        closeSideWindow()
    }else{
        sideWindowStatus = true;
        openSideWindow()
    }
})
usersIcon.addEventListener('click',()=>{
    if(sideWindowStatus == true){
        sideWindowStatus =false 
        closeSideWindow()
    }else{
        sideWindowStatus = true;
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

function toggleVideoOnOff(){
    
    let user = document.getElementById(myId)

    if(user.children[0].children[0].style.display != 'none'){
        user.children[0].children[0].style.display='none'
        user.children[0].children[1].style.display='flex'
        
    }else{
        user.children[0].children[0].style.display='block'
        user.children[0].children[1].style.display='none'
       
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
console.log(navigator.mediaDevices)
navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream=>{
    myStream=stream

    
    addVideoStream(myId,stream)

     peer.on('call',call=>{
        call.answer(stream)
        
        
        
        call.on('stream',(oldUserVideoStream)=>{
            
            if(!peerArr.includes(call.peer)){
                peerArr.push(call.peer)
                addVideoStream(call.peer,oldUserVideoStream)
            }
        })
     })

    socket.on('user-connected',newUserId=>{
        
        connectToNewUser(newUserId,stream)
        
    })
})

peer.on('open',myId=>{
    
    
    socket.emit('join-room',ROOM_ID,myId)
}) 

function handleResponse(){

}

function connectToNewUser(newUserId,stream){
    //i m calling
    const call = peer.call(newUserId,stream)
    

    // i am receiving

    call.on('stream',userVideoStream =>{
        if(!peerArr.includes(call.peer)){
            peerArr.push(call.peer)
            addVideoStream(call.peer,userVideoStream)
        }
    })
    call.on('close',()=>{
       removeVideo(newUserId)
    })
}

function removeVideo(id){
   let usrWrapper = document.getElementById(id)
   usrWrapper.remove()
}
function addVideoStream(id,stream){
    let layout = document.getElementById('layout')

    let usrWrapper = document.createElement('div')
    let usr = document.createElement('div')
    let video = document.createElement('video')
    let nameDiv = document.createElement('div')
    let p = document.createElement('p')

    usrWrapper.classList.add('user-wrapper')
    usrWrapper.id = id
    usr.classList.add('user')
    nameDiv.classList.add('name')
    p.innerText = name.substring(0,2);

    nameDiv.style.display = 'none'
    usrWrapper.style.backgroundColor =colorArr[Math.floor(Math.random()*colorArr.length)]
    usrWrapper.setAttribute('zoom','false')

    video.muted = true
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

document.addEventListener('DOMContentLoaded',()=>{
    let d = new Date()
    setInterval(()=>{
        timer(d.getHours(),d.getMinutes(),d.getSeconds(),d)
    },1000)
    
})

