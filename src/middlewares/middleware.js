import session from 'express-session'
import User from '../models/user'
import jwt from 'jsonwebtoken'

const getCart = (req, res, next) => {
    const token =  req.cookies.user
    if (token) {
        jwt.verify(token, process.env.JWT_SECRECT, async (err, decodedToken) => {
            let user = await User.findById(decodedToken.id)
            req.session.cart = user.cart
            next()
        })
    }else{
        if(!req.session.cart) {
            req.session.cart = []
            next()
        }
    }
}

export { getCart }
























/*

const jwt = require('jsonwebtoken')
const User = require('../models/user')


const isLogin = (req, res, next) => {
    const token =  req.cookies.user
    if (token) {
        jwt.verify(token, process.env.JWT_SECRECT, async (err, decodedToken)=>{
            if(err) {
                res.redirect('/auth/sign-in')
            }else {
                try {
                    const user = await User.findById(decodedToken.id)
                    next()
                }catch(err){
                    res.redirect('/auth/sign-in')
                }   
            }
            
        })
    }else{
        res.redirect('/auth/sign-in')
    }
    
}

const currentUser = (req, res, next) => {
    const token =  req.cookies.user
    if (token) {
        jwt.verify(token, process.env.JWT_SECRECT, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null
                next()
            }else {
                let user = await User.findById(decodedToken.id)
                user = user.toObject()
                res.locals.user = user
                next()
            }
        })
    }else{
        res.locals.user = null
        next()
    }
}

const isAdmin =  (req, res, next) => {
    const token =  req.cookies.user
    if (token) {
        jwt.verify(token, process.env.JWT_SECRECT, async (err, decodedToken)=>{
            if (err) {
                res.redirect('/auth/sign-in')
            }else {
                let user = await User.findById(decodedToken.id)
                user = user.toObject()
                if (user.type === 'admin') {
                    res.locals.admin = user.type
                    next()
                }else {
                    res.redirect('/auth/sign-in')
                }
                
            }
        })
    }else{
        res.redirect('/auth/sign-in')
    }
}
*/