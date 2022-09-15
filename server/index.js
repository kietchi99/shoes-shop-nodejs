import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import mongooes from 'mongoose'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import methodOverride from 'method-override'
import connectDB from './config/db.js'
import route from './routes/routeIndex.js'


// init app
const app = express()

//middlewares
app.use(express.urlencoded())
app.use(methodOverride('_method'))
app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: process.env.SS_SECRET,
    saveUninitialized: true,
    resave: true 
})) 

dotenv.config()

//static file
app.use(express.static('public'))

//init routes
route(app)

//connect to databases


app.listen(process.env.PORT) //3000