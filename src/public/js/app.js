const socket = new WebSocket(`ws://${window.location.host}`)

socket.addEventListener("open", ()=>{
  socket.send("Connected to the browser ✓")
  console.log("Connected to the server✅")
})

socket.addEventListener("message", (message)=> console.log(message.data))

socket.addEventListener("close", ()=>{
  console.log("Disconnected from the server❌")
})
