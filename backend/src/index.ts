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

const allowedOrigins = [
  "http://localhost:3000",
  /\.vercel\.app$/ 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.some(o => o instanceof RegExp && o.test(origin))
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

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