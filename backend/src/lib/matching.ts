import prisma from './prisma'
import { Role } from '@prisma/client'

interface MatchParams {
  userId: string
  userSkills: string[]
  userRole: Role
  userBatch: string | null
  page?: number
  limit?: number
  typeFilter?: string
}

export const getMatchedFeed = async ({
  userId,
  userSkills,
  userRole,
  userBatch,
  page = 1,
  limit = 10,
  typeFilter
}: MatchParams) => {
  const skip = (page - 1) * limit

  const posts = await prisma.post.findMany({
    where: {
      status: 'ACTIVE',
      authorId: { not: userId },
      AND: [
        {
          OR: [
            { targetRole: null },
            { targetRole: userRole }
          ]
        }
      ],
      ...(typeFilter && { type: typeFilter as any })
    },
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
          linkedinUrl: true
        }
      },
      _count: {
        select: { interests: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  })

  const scored = posts.map(post => {
    const overlap = post.skillTags.filter(tag =>
      userSkills.map(s => s.toLowerCase()).includes(tag.toLowerCase())
    ).length

    const batchMatch = post.batchPref && userBatch
      ? post.batchPref === userBatch ? 1 : 0
      : 0

    const score = overlap * 2 + batchMatch

    return { ...post, relevanceScore: score }
  })

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore)

  const total = await prisma.post.count({
    where: {
      status: 'ACTIVE',
      authorId: { not: userId },
      OR: [
        { targetRole: null },
        { targetRole: userRole }
      ]
    }
  })

  return {
    posts: scored,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}