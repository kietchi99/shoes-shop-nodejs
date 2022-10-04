import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
import mongooes from 'mongoose'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import methodOverride from 'method-override'
import connectDB from './config/db.js'
import route from './routes/index.js'
import { engine } from 'express-handlebars'


// init app
const app = express()
//connect to databases
connectDB()
//middlewares
app.use(cors())
app.use(express.urlencoded())
app.use(methodOverride('_method'))
app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: 'one piece',
    saveUninitialized: true,
    resave: true 
})) 


app.engine('.hbs', engine({extname: '.hbs'}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

//static file
app.use("/public", express.static(__dirname + '/public'));

//init routes
route(app)

app.listen(process.env.PORT) //3000