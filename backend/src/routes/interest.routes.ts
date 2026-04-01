import { Router } from 'express'
import {
  expressInterest,
  getPostApplicants,
  getMyInterests,
  updateInterestStatus,
  withdrawInterest
} from '../controllers/interest.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.post('/', authenticate, expressInterest)
router.get('/my', authenticate, getMyInterests)
router.get('/post/:postId', authenticate, getPostApplicants)
router.patch('/:id', authenticate, updateInterestStatus)
router.delete('/:id', authenticate, withdrawInterest)

export default router