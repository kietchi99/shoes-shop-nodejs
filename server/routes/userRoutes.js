import express from 'express'
const router = express.Router()
import userController from '../controllers/userControllers.js'

router.get('/me', userController.currentUser)
router.get('/total', userController.totalUsers)
router.get('/:id/getbyid', userController.getUserById)
router.post('/sign-up', userController.signUp)
router.post('/sign-in', userController.signIn)
router.put('/reset-password', userController.resetPassword)
router.get('', userController.getAllusers)
router.put('/profile/:id/edit', userController.updateProfile)
router.put('/forgot-password', userController.forgotPassword)





//router.put()
//router.post()

export default router