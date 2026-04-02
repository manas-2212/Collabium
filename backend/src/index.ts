import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import postRoutes from './routes/post.routes'
import interestRoutes from './routes/interest.routes'
import notificationRoutes from './routes/notification.routes'
import adminRoutes from './routes/admin.routes'

import { errorHandler } from './middleware/error.middleware'

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/interests', interestRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RUnite API is running' })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Collabium server running on port ${PORT}`)
})

export default app