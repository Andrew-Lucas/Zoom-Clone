import express from "express"

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

app.listen(PORT, () =>console.log(`✅Server listening from http://localhost:${PORT}`))
 