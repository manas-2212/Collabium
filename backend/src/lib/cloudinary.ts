import cloudinary from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'runite/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }]
  } as any
})

export const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'runite/resumes',
    allowed_formats: ['pdf'],
    resource_type: 'raw'
  } as any
})

export default cloudinary.v2