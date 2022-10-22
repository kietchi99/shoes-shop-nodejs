import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan';
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean'
import methodOverride from 'method-override'
import connectDB from './config/db.js'
import routes from './routes/index.js'
import AppError from './utils/appError.js'
import globalErrorHandler from './controllers/errorControllers.js'

//config .env
dotenv.config()

// init app
const app = express()

//connect to databases
connectDB()

//middlewares
app.use(cors())
app.use(express.urlencoded())
app.use(methodOverride('_method'))
app.use(express.json())
app.use(mongoSanitize())
app.use(xss())
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//static file
app.use("/public", express.static(__dirname + '/public'));

//init routes
routes(app)

//error middlewares
app.all('*', (req, res, next)=>{
    next(new AppError(`Trang '${req.originalUrl}' không tồn tại`, 404));
});
app.use(globalErrorHandler)

app.listen(process.env.PORT) //5000