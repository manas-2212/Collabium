# Collabium

**A verified alumni-student networking platform for universities.**

Collabium brings students and alumni together in one trusted space — to share jobs, internships, startup pitches, and collaboration opportunities. Built with a skill-based matching engine that surfaces relevant posts for each user automatically.

> Inspired by JITO (Jain International Trade Organisation) — applying the concept of a trusted, verified professional network to the university level.

---

## Live Demo

- **Frontend:** https://collabium-1le0lujpv-manas-projects-2c52bcd7.vercel.app/
- **Backend:** https://collabium.onrender.com

---

## Features

- **Verified auth** — university email auto-verifies students; alumni go through admin approval
- **Opportunity feed** — jobs, internships, collabs, and pitches in one matched feed
- **Skill-based matching** — posts are scored and ranked by overlap with your skills and batch
- **Pitch board** — share startup ideas, find co-founders, gather interest from the community
- **Express interest flow** — one-click apply with optional message; poster gets notified instantly
- **Applicant view** — poster sees all applicants with skills, GitHub, LinkedIn, and resume inline
- **In-app notifications** — real-time alerts for interest received, post approved, new matches
- **Admin panel** — verify alumni accounts, moderate posts, view platform stats
- **3 user roles** — Student, Alumni, Admin with full role-based access control

---

## Tech Stack

### Frontend
| Technology | Usage |
|---|---|
| Next.js 16 (App Router) | Frontend framework |
| TypeScript | Type safety |
| Framer Motion | Animations |
| Axios | API client |
| Tailwind CSS | Styling |

### Backend
| Technology | Usage |
|---|---|
| Express.js v5 | REST API server |
| Prisma ORM v6 | Database access layer |
| MongoDB Atlas | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Nodemailer | OTP email verification | (In progress)
| Cloudinary | Avatar + resume file storage | (In progress)
| Multer | File upload middleware | (In progress)

---

## Architecture

```
collabium/
├── frontend/          # Next.js App Router
│   ├── app/           # Pages
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # API client, auth helpers
│   └── types/         # TypeScript interfaces
└── backend/           # Express.js API
    ├── src/
    │   ├── routes/        # API route definitions
    │   ├── controllers/   # Business logic
    │   ├── middleware/     # Auth, RBAC, upload, error
    │   ├── lib/           # Prisma, Cloudinary, mailer, matching engine
    │   └── utils/         # JWT, OTP, validation helpers
    └── prisma/
        └── schema.prisma  # Database schema
```

---

## API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify
POST   /api/auth/resend-otp
```

### Users
```
GET    /api/users/me
GET    /api/users/:id
PATCH  /api/users/profile
POST   /api/users/avatar
POST   /api/users/resume
```

### Posts
```
GET    /api/posts/feed          # skill-matched feed
GET    /api/posts/my
GET    /api/posts/:id
POST   /api/posts
PATCH  /api/posts/:id
DELETE /api/posts/:id
```

### Interests
```
POST   /api/interests
GET    /api/interests/my
GET    /api/interests/post/:postId
PATCH  /api/interests/:id
DELETE /api/interests/:id
```

### Notifications
```
GET    /api/notifications
PATCH  /api/notifications/read-all
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id
```

### Admin
```
GET    /api/admin/stats
GET    /api/admin/users
PATCH  /api/admin/users/:id/verify
PATCH  /api/admin/users/:id/role
GET    /api/admin/posts
DELETE /api/admin/posts/:id
```

---

## Database Schema

```prisma
model User {
  id          String   # MongoDB ObjectId
  name        String
  email       String   # unique
  password    String   # bcrypt hashed
  role        Role     # STUDENT | ALUMNI | ADMIN
  batch       String?
  skills      String[]
  domain      String?
  avatar      String?  # Cloudinary URL
  bio         String?
  isVerified  Boolean
  githubUrl   String?
  linkedinUrl String?
  resumeUrl   String?  # Cloudinary PDF URL
}

model Post {
  id          String
  authorId    String
  type        PostType   # JOB | INTERNSHIP | COLLAB | PITCH
  title       String
  description String
  skillTags   String[]   # used for matching
  batchPref   String?
  targetRole  Role?      # null = everyone
  status      PostStatus # ACTIVE | CLOSED | PENDING_REVIEW
}

model Interest {
  id        String
  postId    String
  userId    String
  status    InterestStatus  # PENDING | SEEN | SHORTLISTED | REJECTED
  message   String?
  @@unique([postId, userId])  # one interest per post per user
}
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account (for file uploads)
- Gmail account (for OTP emails)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/collabium.git
cd collabium
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `.env`:
```env
DATABASE_URL="mongodb+srv://<user>:<pass>@cluster.mongodb.net/collabium"
JWT_SECRET="your_secret_key"
JWT_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
MAIL_USER=""
MAIL_PASS=""
PORT=8000
CLIENT_URL="http://localhost:3000"
```

```bash
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

### 4. Open the app
```
http://localhost:3000
```

---

## How the Matching Engine Works

When a user loads their feed, the backend:

1. Fetches the user's `skills` array and `role` from the database
2. Queries all `ACTIVE` posts excluding the user's own, filtered by `targetRole`
3. For each post, calculates a `relevanceScore`:
   - +2 points per overlapping skill between `post.skillTags` and `user.skills`
   - +1 point if `post.batchPref` matches `user.batch`
4. Sorts posts by `relevanceScore` descending — most relevant first
5. All posts are visible regardless of score (unmatched posts appear below matched ones)

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
vercel --prod
```

### Backend → Render
- Connect your GitHub repo to Render
- Set root directory to `backend`
- Build command: `npm install && npx prisma generate`
- Start command: `npm start`
- Add all `.env` variables in Render dashboard

---

## Roadmap

- [ ] Real-time DM / chat (Socket.io)
- [ ] Events board with RSVP
- [ ] Mentorship booking — alumni offer slots, students book
- [ ] Email OTP verification (production)
- [ ] Mobile responsive polish
- [ ] CSV export for admin

---

## Author

**Manas Selukar**
- GitHub: https://github.com/manas-2212
- LinkedIn: https://www.linkedin.com/in/manas-selukar-0a10312a8/
- Email: manas.selukar2024@nst.rishihood.edu.in

---

## License

MIT
