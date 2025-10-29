//imports
const express = require("express")
const app = express()
//configuracion avanzada para testeo en browser
const cors = require("cors")

require ("dotenv").config()
const connectDB = require('./config/db')

//middlewares
connectDB()

app.use(cors())

//manejo de respuestas y peticiones en JSON
app.use(express.json())

//ruteos

app.use('/usuarios', require('./routes/usuarios'))

app.use('/articulos', require('./routes/obrasArt'))

app.use('/perfiles', require('./routes/perfilUser'))

app.listen(process.env.PORT, ()=>{
    console.log(`Servidor conectado en ${process.env.PORT}`)
})

app.get('/', (res)=>{
    res.send("API funcionando")
})