import { Request, Response, NextFunction } from 'express'
import { Role } from '@prisma/client'

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthenticated' })
      return
    }
    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({ message: 'Forbidden — insufficient role' })
      return
    }
    next()
  }
}