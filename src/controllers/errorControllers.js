import AppError from '../utils/appError.js'

const sendErrorDev = (err, res) =>{
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

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

const handleCastErrorDB = err => {
    const message = `Giá trị ${err.value} của ${err.path} không hợp lệ`
    return new AppError(message, 400)
}
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)

    const message = `Giá trị ${value} bị trùng lặp`
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const error = Object.values(err.errors).map(val=>val.message);
    const message = `Giá trị nhập vào không hợp lệ. ${error.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Token không hợp lệ', 401)
const handleJWTExpiredError = () => new AppError('Token hết hạn', 401)

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