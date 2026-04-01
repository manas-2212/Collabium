export type Role = 'STUDENT' | 'ALUMNI' | 'ADMIN'

export type PostType = 'JOB' | 'INTERNSHIP' | 'COLLAB' | 'PITCH'

export type PostStatus = 'ACTIVE' | 'CLOSED' | 'PENDING_REVIEW'

export type InterestStatus = 'PENDING' | 'SEEN' | 'SHORTLISTED' | 'REJECTED'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  batch: string | null
  skills: string[]
  domain: string | null
  avatar: string | null
  bio: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  resumeUrl: string | null
  isVerified: boolean
  createdAt?: string
}

export interface Post {
  id: string
  authorId: string
  author: Partial<User>
  type: PostType
  title: string
  description: string
  skillTags: string[]
  batchPref: string | null
  targetRole: Role | null
  status: PostStatus
  createdAt: string
  updatedAt: string
  relevanceScore?: number
  _count?: { interests: number }
}

export interface Interest {
  id: string
  postId: string
  userId: string
  user?: Partial<User>
  post?: Partial<Post>
  status: InterestStatus
  message: string | null
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  message: string
  refId: string | null
  isRead: boolean
  createdAt: string
}

export interface PaginatedResponse<T> {
  posts?: T[]
  users?: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}