import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, isVerified, page, limit } = req.query

    const pageNum = page ? parseInt(page as string) : 1
    const limitNum = limit ? parseInt(limit as string) : 20
    const skip = (pageNum - 1) * limitNum

    const where: any = {}
    if (role) where.role = role
    if (isVerified !== undefined) where.isVerified = isVerified === 'true'

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          batch: true,
          domain: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              interests: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    res.status(200).json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch users' })
  }
}

export const verifyAlumni = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.user!.id
    const id = req.params.id as string
    const { action } = req.body

    if (!action || !['approve', 'reject'].includes(action)) {
      res.status(400).json({ message: 'Action must be approve or reject' })
      return
    }

    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if (user.role !== 'ALUMNI') {
      res.status(400).json({ message: 'User is not an alumni' })
      return
    }

    if (action === 'approve') {
      await prisma.user.update({
        where: { id },
        data: { isVerified: true }
      })

      await prisma.notification.create({
        data: {
          userId: id,
          type: 'ACCOUNT_VERIFIED',
          message: 'Your alumni account has been verified. Welcome to RUnite!'
        }
      })

      await prisma.adminAction.create({
        data: {
          adminId,
          targetId: id,
          actionType: 'VERIFY_ALUMNI',
          note: 'Alumni account approved'
        }
      })

      res.status(200).json({ message: 'Alumni verified successfully' })
    } else {
      await prisma.user.delete({ where: { id } })

      await prisma.adminAction.create({
        data: {
          adminId,
          targetId: id,
          actionType: 'REJECT_ALUMNI',
          note: 'Alumni account rejected and removed'
        }
      })

      res.status(200).json({ message: 'Alumni account rejected and removed' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to process verification' })
  }
}

export const changeUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.user!.id
    const id = req.params.id as string
    const { role } = req.body

    const validRoles = ['STUDENT', 'ALUMNI', 'ADMIN']
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}` })
      return
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    await prisma.user.update({
      where: { id },
      data: { role }
    })

    await prisma.adminAction.create({
      data: {
        adminId,
        targetId: id,
        actionType: 'CHANGE_ROLE',
        note: `Role changed from ${user.role} to ${role}`
      }
    })

    res.status(200).json({ message: `User role updated to ${role}` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to change role' })
  }
}

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, page, limit } = req.query

    const pageNum = page ? parseInt(page as string) : 1
    const limitNum = limit ? parseInt(limit as string) : 20
    const skip = (pageNum - 1) * limitNum

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          _count: {
            select: { interests: true }
          }
        }
      }),
      prisma.post.count({ where })
    ])

    res.status(200).json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch posts' })
  }
}

export const removePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.user!.id
    const id = req.params.id as string
    const { reason } = req.body

    const post = await prisma.post.findUnique({ where: { id } })

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    await prisma.interest.deleteMany({ where: { postId: id } })
    await prisma.post.delete({ where: { id } })

    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: 'POST_REMOVED',
        message: `Your post "${post.title}" was removed by admin.${reason ? ` Reason: ${reason}` : ''}`
      }
    })

    await prisma.adminAction.create({
      data: {
        adminId,
        targetId: id,
        actionType: 'REMOVE_POST',
        note: reason || 'Post removed by admin'
      }
    })

    res.status(200).json({ message: 'Post removed successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to remove post' })
  }
}

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalAlumni,
      pendingAlumni,
      totalPosts,
      activePosts,
      totalInterests,
      newUsersThisWeek,
      newPostsThisWeek
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'ALUMNI' } }),
      prisma.user.count({ where: { role: 'ALUMNI', isVerified: false } }),
      prisma.post.count(),
      prisma.post.count({ where: { status: 'ACTIVE' } }),
      prisma.interest.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.post.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    res.status(200).json({
      users: {
        total: totalUsers,
        students: totalStudents,
        alumni: totalAlumni,
        pendingVerification: pendingAlumni
      },
      posts: {
        total: totalPosts,
        active: activePosts
      },
      interests: {
        total: totalInterests
      },
      thisWeek: {
        newUsers: newUsersThisWeek,
        newPosts: newPostsThisWeek
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
}