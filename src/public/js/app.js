const socket = io()

const myVideo = document.getElementById('myVideo')
const cameraDevices = document.getElementById('cameras')
const muteBtn = document.getElementById('muteBtn')
const cameraBtn = document.getElementById('disableCameraBtn')

let videoStream
let muted = false
let disabledCamera = false
let myPeerConnection
let myDataChannel

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: 'user' },
  }
  const cameraConstrains = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  }
  try {
    videoStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
    )
    myVideo.srcObject = videoStream
    if (!deviceId) {
      await getCameras()
    }
  } catch (err) {
    console.log(err)
  }
}

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter((device) => device.kind === 'videoinput')
    const currentCamera = videoStream.getVideoTracks()[0]
    cameras.forEach((camera) => {
      const optDevice = document.createElement('option')
      optDevice.value = camera.deviceId
      optDevice.innerText = camera.label
      cameraDevices.appendChild(optDevice)
      if (currentCamera.label === camera.label) {
        optDevice.selected = true
      }
    })
  } catch (err) {
    console.log(err)
  }
}

function handleMuteClick() {
  videoStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled))
  if (muted) {
    muted = false
  } else {
    muted = true
  }
  muteBtn.innerText = muted ? 'Unmute' : 'Mute'
}

function handleCameraClick() {
  videoStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled))
  if (!disabledCamera) {
    disabledCamera = true
  } else {
    disabledCamera = false
  }
  cameraBtn.innerText = disabledCamera ? 'Enable Camera' : 'Disable Camera'
}

async function handleCameraChange() {
  await getMedia(cameraDevices.value)
  if(myPeerConnection){
    const videoTrack = videoStream.getVideoTracks()[0]
    const videoSender = myPeerConnection.getSenders().find((sender)=> sender.track.kind === "video")
    videoSender.replaceTrack(videoTrack)
  }
}

cameraDevices.addEventListener('input', handleCameraChange)
muteBtn.addEventListener('click', handleMuteClick)
cameraBtn.addEventListener('click', handleCameraClick)

// forms and calls
const startNoom = document.getElementById('start')
const enterRoomForm = startNoom.querySelector('form')

const callsNoom = document.getElementById('call')
callsNoom.hidden = true

let roomName

async function initCall() {
  startNoom.hidden = true
  callsNoom.hidden = false
  await getMedia()
  makeConnection()
}

async function handleRoomSubmit(submitEvent) {
  submitEvent.preventDefault()
  const roomNameInput = enterRoomForm.querySelector('input')
  roomName = roomNameInput.value
  roomNameInput.value = ''
  await initCall()
  socket.emit('join_room', roomName)
}
enterRoomForm.addEventListener('submit', handleRoomSubmit)

// messages
const messageForm = document.getElementById("message-form")
const messageUl = document.getElementById("message-ul")


let msgText;
function handleSendMessage(msgEvent){
  msgEvent.preventDefault()
  const msgInput = messageForm.querySelector("input")
  console.log(msgInput.value)
  const li = document.createElement("li")
  li.innerText = `You: ${msgInput.value}`
  messageUl.appendChild(li)
  myDataChannel.send(msgInput.value)
}

// socket

function handleDataChannel(event){
  console.log(event.data)
  const li = document.createElement("li")
  li.innerText = `Anon: ${event.data}`
  messageUl.appendChild(li)
}
socket.on('welcome_to_room', async() => {
  myDataChannel = myPeerConnection.createDataChannel("chat")
  myDataChannel.addEventListener("message", handleDataChannel)
  messageForm.addEventListener("submit", handleSendMessage)
  const offer = await myPeerConnection.createOffer()
  myPeerConnection.setLocalDescription(offer)
  socket.emit("offer", roomName, offer)
  console.log('Sent offer')
})
console.log(messageForm)
socket.on("offer", async(offer)=>{
  myPeerConnection.addEventListener("datachannel", (event)=>{
    myDataChannel = event.channel
    myDataChannel.addEventListener("message", handleDataChannel)
    messageForm.addEventListener("submit", handleSendMessage)
  })
  myPeerConnection.setRemoteDescription(offer)
  console.log("Recieved offer")
  const answer = await myPeerConnection.createAnswer()
  myPeerConnection.setLocalDescription(answer)
  console.log("Generated and Sent answer")
  socket.emit("answer", roomName, answer)
})

socket.on("answer", (answer)=>{
  console.log("Recieved answer")
  myPeerConnection.setRemoteDescription(answer)
})

socket.on("ice", (iceCandidate)=>{
  console.log("Recieved IceCandidate")
  myPeerConnection.addIceCandidate(iceCandidate)
})

// RTC Connection
function handleIceCandidate(data){
  console.log("Sent IceCandidate")
  socket.emit("ice", roomName, data.candidate)
}
function handleAddStream(streamEvent){
  console.log("Got a stream event")
  const candidateVideo = document.createElement("video")
  /* autoplay,playsinline, width="400", height="370" */
  candidateVideo.autoplay = true
  candidateVideo.playsInline = true
  candidateVideo.height = 400
  candidateVideo.width = 370
  candidateVideo.srcObject = streamEvent.stream
  callsNoom.append(candidateVideo)
}

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers:[
      {
        urls: [
          'stun:stun.l.google.com.19302',
          'stun:stun1.l.google.com.19302',
          'stun:stun2.l.google.com.19302',
          'stun:stun3.l.google.com.19302',
          'stun:stun4.l.google.com.19302',
        ]
      }
    ]
  })
  myPeerConnection.addEventListener("icecandidate", handleIceCandidate)
  myPeerConnection.addEventListener("addstream", handleAddStream)
  videoStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, videoStream))
}
