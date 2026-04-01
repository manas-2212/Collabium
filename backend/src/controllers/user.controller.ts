import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { sanitizeProfileLinks } from '../utils/validate'

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        batch: true,
        skills: true,
        domain: true,
        avatar: true,
        bio: true,
        githubUrl: true,
        linkedinUrl: true,
        resumeUrl: true,
        isVerified: true,
        createdAt: true,
        posts: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            title: true,
            skillTags: true,
            createdAt: true
          }
        }
      }
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.status(200).json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
}

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const {
      name,
      bio,
      batch,
      domain,
      skills,
      githubUrl,
      linkedinUrl,
      resumeUrl
    } = req.body

    const sanitizedLinks = sanitizeProfileLinks({
      githubUrl,
      linkedinUrl,
      resumeUrl
    })

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(batch && { batch }),
        ...(domain && { domain }),
        ...(skills && { skills }),
        ...sanitizedLinks
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        batch: true,
        skills: true,
        domain: true,
        avatar: true,
        bio: true,
        githubUrl: true,
        linkedinUrl: true,
        resumeUrl: true
      }
    })

    res.status(200).json({ message: 'Profile updated', user: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update profile' })
  }
}

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' })
      return
    }

    const avatarUrl = (req.file as any).path

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl }
    })

    res.status(200).json({ message: 'Avatar uploaded', avatarUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Avatar upload failed' })
  }
}

export const uploadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' })
      return
    }

    const resumeUrl = (req.file as any).path

    await prisma.user.update({
      where: { id: userId },
      data: { resumeUrl }
    })

    res.status(200).json({ message: 'Resume uploaded', resumeUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Resume upload failed' })
  }
}

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        batch: true,
        skills: true,
        domain: true,
        avatar: true,
        bio: true,
        githubUrl: true,
        linkedinUrl: true,
        resumeUrl: true,
        isVerified: true
      }
    })

    res.status(200).json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch user' })
  }
}