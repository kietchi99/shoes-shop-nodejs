import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import path from 'path'
import mongooes from 'mongoose'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import methodOverride from 'method-override'
import connectDB from './config/db.js'
import route from './routes/index.js'


// init app
const app = express()
//connect to databases
connectDB()
//middlewares
app.use(express.urlencoded())
app.use(methodOverride('_method'))
app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: 'one piece',
    saveUninitialized: true,
    resave: true 
})) 

//static file
app.use(express.static('public'))

//init routes
route(app)

app.listen(process.env.PORT) //3000