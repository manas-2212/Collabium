import multer from 'multer'
import { avatarStorage, resumeStorage } from '../lib/cloudinary'

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }
})

export const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
})