import http from "http"
import {Server} from "socket.io"
import {instrument} from "@socket.io/admin-ui"
import express from "express"
import { Socket } from "net"

const app = express()
const PORT = 4000

app.set('view engine', 'pug')
app.set('views', __dirname + '/views')

app.use("/public", express.static(__dirname + "/public"))
app.get("/", (req, res)=>{
  return res.render("home")
})
app.get("/*", (req, res)=>{
  return res.redirect("/")
})

const httpServer = http.createServer(app)
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
})

instrument(wsServer, {
  auth: false,
})

wsServer.on("connection", socket=>{
  socket["nickname"] = "Anonymous"
  socket.onAny((socketEvent)=>{
    console.log(`Socket Event: ${socketEvent}`)
    console.log(socket.rooms)
  })

  socket.on("save_nickname", (nickname)=>{
    socket["nickname"] = nickname
    socket.emit("saved_nickname", nickname)
  })

  function publicRooms(){
    const {sids, rooms} = wsServer.sockets.adapter
/*     console.log("SIDS::", sids, "ROOMS::", rooms) */
    const publicRooms = []
    rooms.forEach((_, key)=>{
      if(sids.get(key) === undefined){
        publicRooms.push(key)
      }
    })
    console.log(publicRooms)
    return publicRooms
  }

  function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size
  }

  socket.on("enter_channel", (roomName, done)=>{
    socket.join(roomName)
    done() 
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName))
    wsServer.sockets.emit("room_change", publicRooms())
  })

  socket.on("disconnecting", ()=>{
    socket.rooms.forEach((room)=> socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1))
  })

  socket.on("disconnect", ()=>{
    wsServer.sockets.emit("room_change", publicRooms()) 
  })

  socket.on("send_message", (newMessage, room, done)=>{
    done()
    console.log(newMessage)
    socket.to(room).emit("new_message", `${socket.nickname}: ${newMessage}`)
  })
})



/* const wss = new WebSocket.Server({server})

 let socketArr = []
wss.on("connection", (socket)=>{
  console.log("Connected to the browser ✓")
  socketArr.push(socket)
  socket["nickname"] = "Anonymous"
  socket.on("open", ()=>{
  })
  socket.on("close", ()=>{
    console.log("Disconnected from the browser💀")
  })
  socket.addEventListener("message", (message)=> {
    const parse = JSON.parse(message.data)
    console.log(parse)
    switch (parse.type){
      case "sms":
        socketArr.forEach((eachSocket)=> eachSocket.send(`${socket.nickname}: ${parse.value}`))
      case "nickname":
        socket["nickname"] = parse.value
    }
  })
}) */


httpServer.listen(PORT, () =>console.log(`✅Server listening from http://localhost:${PORT}`))
