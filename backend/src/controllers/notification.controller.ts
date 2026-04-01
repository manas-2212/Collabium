import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const unreadCount = notifications.filter(n => !n.isRead).length

    res.status(200).json({ notifications, unreadCount })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch notifications' })
  }
}

export const markOneRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const id = req.params.id as string

    const notification = await prisma.notification.findUnique({
      where: { id }
    })

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' })
      return
    }

    if (notification.userId !== userId) {
      res.status(403).json({ message: 'Not authorized' })
      return
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    res.status(200).json({ message: 'Marked as read' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to mark notification as read' })
  }
}

export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })

    res.status(200).json({ message: 'All notifications marked as read' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to mark all as read' })
  }
}

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const id = req.params.id as string

    const notification = await prisma.notification.findUnique({
      where: { id }
    })

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' })
      return
    }

    if (notification.userId !== userId) {
      res.status(403).json({ message: 'Not authorized' })
      return
    }

    await prisma.notification.delete({ where: { id } })

    res.status(200).json({ message: 'Notification deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to delete notification' })
  }
}