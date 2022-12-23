import http from "http"
import SocketIO from "socket.io"
import express from "express"
import { Socket } from "net"

console.log("Hi")
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
const wsServer = SocketIO(httpServer)

wsServer.on("connection", socket=>{

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
 