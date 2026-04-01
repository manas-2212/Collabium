import { Router } from 'express'
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadResume,
  getMe
} from '../controllers/user.controller'
import { authenticate } from '../middleware/auth.middleware'
import {
  uploadAvatar as avatarUpload,
  uploadResume as resumeUpload
} from '../middleware/upload.middleware'

const router = Router()

router.get('/me', authenticate, getMe)
router.get('/:id', getProfile)
router.patch('/profile', authenticate, updateProfile)
router.post('/avatar', authenticate, avatarUpload.single('avatar'), uploadAvatar)
router.post('/resume', authenticate, resumeUpload.single('resume'), uploadResume)

export default router