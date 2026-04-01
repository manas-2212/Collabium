import { Router } from 'express'
import {
  register,
  verifyEmail,
  login,
  resendOTP
} from '../controllers/auth.controller'

const router = Router()

router.post('/register', register)
router.post('/verify', verifyEmail)
router.post('/login', login)
router.post('/resend-otp', resendOTP)

export default router