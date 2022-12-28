const socket = io()

const myVideo = document.getElementById("myVideo")
const cameraDevices = document.getElementById("cameras")
const muteBtn = document.getElementById("muteBtn")
const cameraBtn = document.getElementById("disableCameraBtn")

let videoStream;
let muted = false
let disabledCamera = false

async function getCameras(){
  try{
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === "videoinput")
    const currentCamera = videoStream.getVideoTracks()[0]
    cameras.forEach((camera)=>{
      const optDevice = document.createElement("option")
      optDevice.value = camera.deviceId
      optDevice.innerText = camera.label
      cameraDevices.appendChild(optDevice)
      if(currentCamera.label === camera.label){
        optDevice.selected = true
      }
    })
  } catch(err){
    console.log(err)
  }
}

async function getMedia(deviceId){
  const initialConstrains = {
    audio: true,
    video: {facingMode: "user"}
  }
  const cameraConstrains = {
    audio: true,
    video:{deviceId: {exact: deviceId}}
  }
  try{
    videoStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstrains : initialConstrains)
    myVideo.srcObject = videoStream
    if(!deviceId){
      await getCameras()
    }
  } catch(err){
    console.log(err)
  }
}
getMedia()
getCameras()

function handleMuteClick(){
  videoStream.getAudioTracks().forEach(track => track.enabled = !track.enabled)
  if (muted) {
    muted = false
  } else {
    muted = true
  }
  muteBtn.innerText = muted ? 'Unmute' : 'Mute'
}

function handleCameraClick(){
  videoStream.getVideoTracks().forEach(track => track.enabled = !track.enabled)
  if (!disabledCamera) {
    disabledCamera = true
  } else {
    disabledCamera = false
  }
  cameraBtn.innerText = disabledCamera ? "Enable Camera" : "Disable Camera"
}

async function handleCameraChange(){
  await getMedia(cameraDevices.value)
}

cameraDevices.addEventListener("input", handleCameraChange)
muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)
