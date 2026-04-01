import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const expressInterest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { postId, message } = req.body

    if (!postId) {
      res.status(400).json({ message: 'postId is required' })
      return
    }

    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    if (post.authorId === userId) {
      res.status(400).json({ message: 'Cannot express interest in your own post' })
      return
    }

    if (post.status !== 'ACTIVE') {
      res.status(400).json({ message: 'This post is no longer active' })
      return
    }

    const existing = await prisma.interest.findUnique({
      where: {
        postId_userId: { postId, userId }
      }
    })

    if (existing) {
      res.status(409).json({ message: 'Already expressed interest in this post' })
      return
    }

    const interest = await prisma.interest.create({
      data: {
        postId,
        userId,
        message: message || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            batch: true,
            skills: true,
            githubUrl: true,
            linkedinUrl: true,
            resumeUrl: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      }
    })

    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: 'INTEREST_RECEIVED',
        message: `Someone expressed interest in your post "${post.title}"`,
        refId: interest.id
      }
    })

    res.status(201).json({ message: 'Interest expressed successfully', interest })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to express interest' })
  }
}

export const getPostApplicants = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const postId = req.params.postId as string

    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    if (post.authorId !== userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only the post author can view applicants' })
      return
    }

    const interests = await prisma.interest.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            batch: true,
            skills: true,
            domain: true,
            bio: true,
            githubUrl: true,
            linkedinUrl: true,
            resumeUrl: true
          }
        }
      }
    })

    res.status(200).json({
      postId,
      postTitle: post.title,
      total: interests.length,
      applicants: interests
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch applicants' })
  }
}

export const getMyInterests = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const interests = await prisma.interest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                batch: true
              }
            }
          }
        }
      }
    })

    res.status(200).json({ interests })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch interests' })
  }
}

export const updateInterestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const id = req.params.id as string
    const { status } = req.body

    const validStatuses = ['PENDING', 'SEEN', 'SHORTLISTED', 'REJECTED']
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` })
      return
    }

    const interest = await prisma.interest.findUnique({
      where: { id },
      include: { post: true }
    })

    if (!interest) {
      res.status(404).json({ message: 'Interest not found' })
      return
    }

    if (interest.post.authorId !== userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only the post author can update interest status' })
      return
    }

    const updated = await prisma.interest.update({
      where: { id },
      data: { status }
    })

    await prisma.notification.create({
      data: {
        userId: interest.userId,
        type: 'INTEREST_STATUS_UPDATED',
        message: status === 'SHORTLISTED'
          ? `You've been shortlisted for "${interest.post.title}"`
          : `Your application for "${interest.post.title}" was not selected`,
        refId: interest.id
      }
    })

    res.status(200).json({ message: 'Status updated', interest: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update status' })
  }
}

export const withdrawInterest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const id = req.params.id as string

    const interest = await prisma.interest.findUnique({
      where: { id }
    })

    if (!interest) {
      res.status(404).json({ message: 'Interest not found' })
      return
    }

    if (interest.userId !== userId) {
      res.status(403).json({ message: 'Not authorized' })
      return
    }

    await prisma.interest.delete({ where: { id } })

    res.status(200).json({ message: 'Interest withdrawn' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to withdraw interest' })
  }
}