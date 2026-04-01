import { Router } from 'express'
import {
  createPost,
  getFeed,
  getPost,
  updatePost,
  deletePost,
  getMyPosts
} from '../controllers/post.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/feed', authenticate, getFeed)
router.get('/my', authenticate, getMyPosts)
router.get('/:id', getPost)
router.post('/', authenticate, createPost)
router.patch('/:id', authenticate, updatePost)
router.delete('/:id', authenticate, deletePost)

export default router