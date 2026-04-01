import { Router } from 'express'
import {
  getNotifications,
  markOneRead,
  markAllRead,
  deleteNotification
} from '../controllers/notification.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, getNotifications)
router.patch('/read-all', authenticate, markAllRead)
router.patch('/:id/read', authenticate, markOneRead)
router.delete('/:id', authenticate, deleteNotification)

export default router