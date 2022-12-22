import http from "http"
import WebSocket from "ws"
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

const server = http.createServer(app)

const wss = new WebSocket.Server({server}) 

wss.on("connection", (socket)=>{
  socket.on("open", ()=>{
  })
  setTimeout(()=>socket.send("Hi there!!!"), 3000)
  socket.on("close", ()=>{
    console.log("Disconnected from the browser💀")
  })
  socket.addEventListener("message", (message)=> console.log(message.data))
})


server.listen(PORT, () =>console.log(`✅Server listening from http://localhost:${PORT}`))
 