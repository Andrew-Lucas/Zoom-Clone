import http from "http"
import SocketIO from "socket.io"
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
const wsServer = SocketIO(httpServer)

httpServer.listen(PORT, () =>console.log(`✅Server listening from http://localhost:${PORT}`))