const socket = io()

const nickNameForm = document.querySelector(".nick-name_form")
const nickName = nickNameForm.querySelector("input")

const enterChannelForm = document.querySelector(".enter-channel_form")
const channelName = enterChannelForm.querySelector(".channel-name")

const roomChannel = document.getElementById("welcome-channel")
const enterMessageForm = document.querySelector(".enter-message_form")
const messageInput = enterMessageForm.querySelector(".message-text")

enterMessageForm.hidden = true
let roomName;


function saveNickName(submitEvent){
  submitEvent.preventDefault()
  socket.emit("save_nickname", nickName.value)
  roomName = nickName.value
  nickName.value = ""
}
nickNameForm.addEventListener("submit", saveNickName)
socket.on("saved_nickname", (nickname)=>{
  const userNickname = document.getElementById("user-nickname")
  userNickname.innerText = nickname
})

function emitCompleted(){
  enterChannelForm.hidden = true
  nickNameForm.hidden = true
  enterMessageForm.hidden = false
  const chatName = document.querySelector(".chat-name")
  chatName.innerText = `Room ${roomName}`
}
function handleEnterChannel(submitEvent){
  submitEvent.preventDefault()
  socket.emit("enter_channel", channelName.value, emitCompleted)
  roomName = channelName.value
  channelName.value = ""
}

function addMessage(message){
/*   console.log(socket.nickname) */
  const ul = roomChannel.children[1]
  const li = document.createElement("li")
  li.innerText = message
  ul.appendChild(li)
}
socket.on("welcome", (nickname, newCount)=>{
  const chatName = document.querySelector(".chat-name")
  chatName.innerText = `Room ${roomName} (${newCount})`
  console.log("Hello", nickname)
  addMessage(`${nickname} joined this channel`)
})
socket.on("bye", (nickname, newCount)=>{
  const chatName = document.querySelector(".chat-name")
  chatName.innerText = `Room ${roomName} (${newCount})`
  console.log("Bye", nickname)
  addMessage(`${nickname} disconnected`)
})

enterChannelForm.addEventListener("submit", handleEnterChannel)



function sendMessage(submitEvent){
  submitEvent.preventDefault()
  const msgText = messageInput.value
  socket.emit("send_message", messageInput.value, roomName, ()=>{
    addMessage(`You: ${msgText}`)
  })
  messageInput.value = ""
}

socket.on("new_message", addMessage)

socket.on("room_change", (rooms)=>{
  console.log(rooms)
  const roomsUl = enterChannelForm.querySelector("ul")
  roomsUl.innerHTML = ""
  if(rooms.length == 0){
    return;
  }
  rooms.forEach((room)=>{
/*     const exists = rooms.find((eachRoom)=> eachRoom===room)
    if(exists){
      console.log(exists, "already exists")
      return
    }
    console.log(exists) */
    const roomLi = document.createElement("li")
    roomLi.innerText = room
    roomsUl.appendChild(roomLi)
/*     console.log(roomsUl)
    console.log(roomLi) */
  })
})

enterMessageForm.addEventListener("submit", sendMessage)
