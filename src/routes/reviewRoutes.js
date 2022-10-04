import express from 'express'
const router = express.Router()
import reviewController from '../controllers/reviewControllers.js'

router.get('', reviewController.getAllReviews)
router.put('/:id/update', reviewController.updateReview)
router.post('/:id/add', reviewController.addReview)
router.delete('/:id/remove', reviewController.removeReview)
router.get('/:status/getbystatus', reviewController.getReviewByStatus)



export default router