import { Router } from 'express'
import {
  getAllUsers,
  verifyAlumni,
  changeUserRole,
  getAllPosts,
  removePost,
  getStats
} from '../controllers/admin.controller'
import { authenticate } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'

const router = Router()

router.use(authenticate)
router.use(requireRole('ADMIN'))

router.get('/stats', getStats)
router.get('/users', getAllUsers)
router.patch('/users/:id/verify', verifyAlumni)
router.patch('/users/:id/role', changeUserRole)
router.get('/posts', getAllPosts)
router.delete('/posts/:id', removePost)

export default router