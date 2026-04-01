import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { getMatchedFeed } from '../lib/matching'

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const authorId = req.user!.id
    const {
      type,
      title,
      description,
      skillTags,
      batchPref,
      targetRole
    } = req.body

    if (!type || !title || !description) {
      res.status(400).json({ message: 'Type, title and description are required' })
      return
    }

    const validTypes = ['JOB', 'INTERNSHIP', 'COLLAB', 'PITCH']
    if (!validTypes.includes(type)) {
      res.status(400).json({ message: `Type must be one of: ${validTypes.join(', ')}` })
      return
    }

    const post = await prisma.post.create({
      data: {
        authorId,
        type,
        title,
        description,
        skillTags: skillTags || [],
        batchPref: batchPref || null,
        targetRole: targetRole || null
      },
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
    })

    await prisma.notification.create({
      data: {
        userId: authorId,
        type: 'POST_CREATED',
        message: `Your post "${title}" is now live.`,
        refId: post.id
      }
    })

    res.status(201).json({ message: 'Post created', post })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create post' })
  }
}

export const getFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { page, limit, type } = req.query

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true, role: true, batch: true }
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const result = await getMatchedFeed({
      userId,
      userSkills: user.skills,
      userRole: user.role,
      userBatch: user.batch,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      typeFilter: type as string | undefined
    })

    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch feed' })
  }
}

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            batch: true,
            domain: true,
            githubUrl: true,
            linkedinUrl: true,
            resumeUrl: true
          }
        },
        _count: {
          select: { interests: true }
        }
      }
    })

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    res.status(200).json({ post })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch post' })
  }
}

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const id = req.params.id as string
    const { title, description, skillTags, batchPref, targetRole, status } = req.body

    const post = await prisma.post.findUnique({ where: { id } })

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    if (post.authorId !== userId) {
      res.status(403).json({ message: 'Not authorized to edit this post' })
      return
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(skillTags && { skillTags }),
        ...(batchPref && { batchPref }),
        ...(targetRole !== undefined && { targetRole }),
        ...(status && { status })
      }
    })

    res.status(200).json({ message: 'Post updated', post: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update post' })
  }
}

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const id = req.params.id as string

    const post = await prisma.post.findUnique({ where: { id } })

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    if (post.authorId !== userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized to delete this post' })
      return
    }

    await prisma.interest.deleteMany({ where: { postId: id } })
    await prisma.post.delete({ where: { id } })

    res.status(200).json({ message: 'Post deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to delete post' })
  }
}

export const getMyPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { interests: true }
        }
      }
    })

    res.status(200).json({ posts })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch posts' })
  }
}