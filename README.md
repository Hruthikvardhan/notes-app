# 🗒️ Notes App — MERN Stack

A full-featured, Google Keep–style notes application built with **MongoDB, Express, React, and Node.js**. Real JWT authentication, real image uploads via Cloudinary, real MongoDB full-text search — no mock data, no localStorage-only shortcuts.

---

## 🔗 Live Demo

- **Frontend (Vercel):** [https://your-app.vercel.app](https://your-app.vercel.app)
- **Backend API (Render):** [https://your-app.onrender.com/api/health](https://your-app.onrender.com/api/health)
- **GitHub:** [https://github.com/Hruthikvardhan/notes-app](https://github.com/Hruthikvardhan/notes-app)

> Note: the backend is hosted on Render's free tier, which spins down after ~15 minutes of inactivity. The first request after idle can take 30-50 seconds to wake up — this is expected, not a bug.

---

## ✨ Features

### 🔐 Authentication
- Register / login with JWT access + refresh tokens
- Access token (15 min) sent as a Bearer header; refresh token (7 days) stored in an httpOnly cookie
- Axios interceptor silently refreshes an expired access token and retries the original request — no visible logout on expiry
- Change password, upload profile avatar (Cloudinary)

### 📝 Notes — Full CRUD
- **TEXT** notes with a live markdown editor and preview
- **CHECKLIST** notes with add/remove/check items and a progress bar
- **IMAGE** notes with Cloudinary-hosted images
- Soft delete → Trash → auto-purged after 30 days (or restore any time)
- Word count and read time calculated automatically on save
- Autosave every 30 seconds — only writes when something actually changed

### 🗂 Organization
- Pin, archive, color-code (12 presets), tag, and categorize notes
- Public/private toggle — public notes are viewable without logging in
- Categories with their own color/icon; deleting a category detaches its notes instead of deleting them

### 🔍 Search
- Debounced (300ms) full-text search backed by a MongoDB text index
- Results ranked by relevance score, matched terms highlighted

### 📊 Profile & Stats
- Editable name/bio/avatar, theme toggle (light/dark)
- Account statistics via MongoDB aggregation (total notes, notes this month, words written)
- Recent activity log, export all notes as JSON, delete account (cascades all data)

### 🎨 UI/UX
- Google Keep–style masonry grid (`react-masonry-css`)
- Framer Motion animations, skeleton loaders, empty states throughout
- Fully responsive: 1 column on mobile up to 4 columns on desktop

---

## 🛠 Tech Stack

**Backend**
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database + ODM |
| JWT (jsonwebtoken) | Access + refresh token auth |
| bcryptjs | Password hashing |
| Cloudinary + Multer | Image upload and storage |
| Helmet, Compression, Morgan | Security headers, gzip, logging |
| express-validator | Request validation |

**Frontend**
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router 6 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client with auth interceptors |
| Framer Motion | Animations |
| @uiw/react-md-editor | Markdown editing with live preview |
| react-masonry-css | Google Keep–style grid layout |
| react-hot-toast | Toast notifications |

**Infrastructure**
| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Cloudinary | Image storage/CDN |
| Render | Backend hosting |
| Vercel | Frontend hosting |

---

## ⚙️ Custom Hooks

| Hook | Purpose |
|---|---|
| `useAuth` | Auth context — login, register, logout, update user |
| `useNotes` | Notes context — fetch/create/update/trash/pin/archive with optimistic updates |
| `useSearch` | Debounced search against the text-index endpoint |
| `useAutoSave` | Diffs current note against last-saved snapshot, saves every 30s |
| `useTheme` | Light/dark theme toggle, persisted to localStorage |

---

## 📁 Folder Structure

```
notes-app/
├── server/
│   ├── config/            # database.js, cloudinary.js
│   ├── models/             # User, Note, Category, ActivityLog
│   ├── controllers/        # auth, note, category, user
│   ├── routes/              # authRoutes, noteRoutes, categoryRoutes, userRoutes
│   ├── middleware/          # authMiddleware, errorHandler, validate, upload
│   ├── services/            # cloudinaryService, trashCleanupService, statsService
│   ├── utils/                # ApiResponse, ApiError, asyncHandler, wordCounter
│   ├── server.js
│   └── .env.example
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Notes/        # NoteCard, NoteEditor, NoteGrid, ChecklistNote, ColorPicker
    │   │   ├── Layout/        # Sidebar, Topbar, Layout
    │   │   └── UI/             # Button, Modal, Badge, Skeleton, EmptyState
    │   ├── pages/               # Login, Register, Notes, Search, Archive, Trash, Profile, PublicNotes, NotFound
    │   ├── context/               # AuthContext, ThemeContext, NoteContext
    │   ├── hooks/                  # useAuth, useNotes, useSearch, useAutoSave, useTheme
    │   ├── utils/                   # api.js, helpers.js, constants.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- A free Cloudinary account

### 1. Clone and install
```bash
git clone https://github.com/<your-username>/notes-app-mern.git
cd notes-app-mern/notes-app
```

### 2. Backend setup
```bash
cd server
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
# and your Cloudinary credentials in .env
npm run dev
```
Backend runs at **http://localhost:5000**

### 3. Frontend setup
```bash
cd ../client
npm install
npm run dev
```
Frontend runs at **http://localhost:5173** — Vite's dev server proxies `/api/*` to the backend automatically (see `vite.config.js`), so no CORS setup is needed locally.

### 4. Create an account
Visit `http://localhost:5173/register` and sign up.

---

## 📦 Available Scripts

**Backend** (`server/`)
| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart on changes) |
| `npm start` | Start in production mode (`node server.js`) |

**Frontend** (`client/`)
| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build an optimized production bundle |
| `npm run preview` | Preview the production build locally |

---

## 🌐 Deployment

Deployed as two separate services:
- **Backend → Render**: Node Web Service, root directory `server`, build `npm install`, start `npm start`
- **Frontend → Vercel**: root directory `client`, `VITE_API_URL` env var pointed at the Render backend

Full step-by-step instructions, including MongoDB Atlas and Cloudinary setup, CORS configuration, and troubleshooting, are in [`5_deployment_guide.txt`](./5_deployment_guide.txt).

---

## 🧩 Key Technical Concepts

### 1. Dual JWT auth with silent refresh
Access tokens are short-lived (15 min) and kept in `localStorage`; refresh tokens are long-lived (7 days) and kept in an httpOnly cookie, invisible to client-side JS. An Axios response interceptor catches 401s, calls `/auth/refresh-token` once, retries the original request, and queues any other requests that 401'd during the refresh — so the user never sees a surprise logout mid-session.

### 2. MongoDB text search
`Note.js` defines a compound text index across `title`, `contentText`, and `tags`. Search queries use `$text: { $search }` combined with `$meta: 'textScore'` sorting, so results come back ranked by relevance rather than just filtered.

### 3. Optimistic UI
Actions like pin, archive, and trash update local state immediately (`NoteContext`) before the API call resolves, and roll back with a re-fetch if the request fails — the UI never waits on a round-trip for a snappy feel.

### 4. Aggregation-based statistics
Profile statistics (total notes, words written, notes this month) are computed with a MongoDB aggregation pipeline (`statsService.js`) instead of pulling every note into memory and counting client-side.

### 5. Soft-delete with scheduled cleanup
Deleting a note sets `isTrashed: true` and `trashedAt`; a background interval (`trashCleanupService.js`) runs on server boot and every 24 hours, permanently removing anything trashed more than 30 days ago.

---

## 🔮 Future Enhancements

- [ ] Real-time collaboration on shared notes (Socket.io / CRDT)
- [ ] Share a note with a specific user (not just public/private)
- [ ] Email notifications for reminder dates
- [ ] Refresh token rotation + blacklisting
- [ ] Rate limiting on auth endpoints
- [ ] Full test suite (Jest + Supertest backend, React Testing Library frontend)
- [ ] Redis caching layer for hot queries

---

## 📄 Related Documentation

- [`1_requirements_gathering.txt`](./1_requirements_gathering.txt) — full functional/non-functional requirements
- [`2_paper_design_wireframes.txt`](./2_paper_design_wireframes.txt) — ASCII wireframes for every screen
- [`3_sprint_plan.txt`](./3_sprint_plan.txt) — 5-sprint task breakdown (55 tasks)
- [`4_manual_testing.txt`](./4_manual_testing.txt) — full manual test case suite
- [`5_deployment_guide.txt`](./5_deployment_guide.txt) — Render + Vercel deployment walkthrough

---

## 📝 License

This project is open source and available under the MIT License.

---

<p align="center">Built solo by <b>Hruthik</b> using the MERN stack 🚀</p>
