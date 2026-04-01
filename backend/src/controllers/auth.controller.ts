import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { signToken } from '../utils/jwt'
import { generateOTP, storeOTP, verifyOTP } from '../utils/otp'
import { sendOTPEmail } from '../lib/mailer'
import { isValidEmail, isRishihoodEmail } from '../utils/validate'
import { Role } from '@prisma/client'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, batch, domain } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email and password are required' })
      return
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ message: 'Invalid email format' })
      return
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      res.status(409).json({ message: 'Email already registered' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    let assignedRole: Role = Role.ALUMNI
    let isVerified = false

    if (isRishihoodEmail(email)) {
      assignedRole = Role.STUDENT
      isVerified = false
    } else if (role === 'ALUMNI') {
      assignedRole = Role.ALUMNI
      isVerified = true
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
        batch: batch || null,
        domain: domain || null,
        isVerified: true
      }
    })

    if (assignedRole === Role.STUDENT) {
        // const otp = generateOTP()
        // storeOTP(email, otp)
        // await sendOTPEmail(email, otp)

        res.status(201).json({
            message: 'Registered successfully. OTP skipped in dev.',
            userId: user.id,
            requiresOTP: false
        })
      return
    }

    res.status(201).json({
      message: 'Registered successfully. Await admin verification.',
      userId: user.id,
      requiresOTP: false
    })
  } catch (err) {
    console.error('REGISTER ERROR:', err)
    res.status(500).json({ message: 'Registration failed', error: String(err) })
  }
}

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP are required' })
      return
    }

    const valid = verifyOTP(email, otp)
    if (!valid) {
      res.status(400).json({ message: 'Invalid or expired OTP' })
      return
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true }
    })

    res.status(200).json({ message: 'Email verified successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Verification failed' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' })
      return
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    if (!user.isVerified) {
      res.status(403).json({
        message: user.role === Role.STUDENT
          ? 'Please verify your email first'
          : 'Your account is pending admin approval'
      })
      return
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    })

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        batch: user.batch,
        domain: user.domain,
        avatar: user.avatar
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Login failed' })
  }
}

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if (user.isVerified) {
      res.status(400).json({ message: 'Email already verified' })
      return
    }

    const otp = generateOTP()
    storeOTP(email, otp)
    await sendOTPEmail(email, otp)

    res.status(200).json({ message: 'OTP resent successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to resend OTP' })
  }
}