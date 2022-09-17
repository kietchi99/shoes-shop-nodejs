import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'
import User from '../models/user.js'
import Otp from '../models/otp.js'

const sendMail = async (email) => {
    try {
        await Otp.deleteMany({ email})
        const code = Math.floor((Math.random() * 1000) + 1 )
        await Otp.create({email , code, expireIn: new Date().getTime() + 300 * 1000})
        // setup nodemailer
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            secure: false,
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        })
        let info = transporter.sendMail({
            from: `"Nodejs" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "your code",
            text: `${code}`,
            html: `<b>${code}</b>`,
        })
        console.log('Đã gửi mail thành công')
    }catch(err){
        console.log(err)
    }
}
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt()
    password = await bcrypt.hash(password, salt)
    return password
}

export { sendMail, hashPassword }