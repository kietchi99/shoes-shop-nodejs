import AppError from '../utils/appError.js'

// development environment
const sendErrorDev = (err, res) =>{
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

//production environment
const sendErrorProd = (err, res) =>{
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }else {
        console.error('err: ', err)
        res.status(500).json({
            status: 'error',
            message: 'Lỗi do máy chủ'
        })
    }   
}

//Cast error
const handleCastErrorDB = err => {
    const message = `Giá trị ${err.value} của ${err.path} không hợp lệ`
    return new AppError(message, 400)
}

//Duplicate error
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)

    const message = `Giá trị ${value} bị trùng lặp`
    return new AppError(message, 400)
}

//Validation error
const handleValidationErrorDB = err => {
    const error = Object.values(err.errors).map(val=>val.message);
    const message = `Giá trị nhập vào không hợp lệ. ${error.join('. ')}`
    return new AppError(message, 400)
}

//JWT Invalid 
const handleJWTError = () => new AppError('Token không hợp lệ', 401)

//JWT expired error
const handleJWTExpiredError = () => new AppError('Token hết hạn', 401)

//Global error
const globalErrorHandler = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res)
    }else if (process.env.NODE_ENV === 'production') {
        let error = {}
        if(err.name === 'CastError') error = handleCastErrorDB(err);
        if(err.code === 11000) error = handleDuplicateFieldsDB(err);
        if(err.name === 'ValidationError') error = handleValidationErrorDB(err);
        if(err.name === 'JsonWebTokenError') error = handleJWTError();
        if(err.name === 'TokenExpiredError') error = handleJWTExpiredError();
        
        if (!error.status) sendErrorProd(err, res)
        else sendErrorProd(error, res)
    }
}

export default globalErrorHandler