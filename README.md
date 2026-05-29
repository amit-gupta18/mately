# Mately ⚡

A real-time collaborative study room platform. Create virtual study rooms, study alongside others with a shared synced timer, chat live, and track your session history.

**Live:** [mately-delta.vercel.app](https://mately-delta.vercel.app)

---

## Project Setup

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (free M0 works)

### 1. Clone the repo

```bash
git clone https://github.com/amit-gupta18/mately.git
cd mately
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env      # then fill in your values
npm run dev               # starts on http://localhost:5000
```

**`server/.env`**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/study-room
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 3. Frontend

```bash
cd client
npm install
# .env.local is already configured for local dev
npm run dev               # starts on http://localhost:3000
```

**`client/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Open `http://localhost:3000` — register an account and you're in.

---

## Features

- **Authentication** — register / login / logout via JWT stored in httpOnly cookies; session persists across page refreshes
- **Study Rooms** — create public or private rooms; browse and join existing rooms; invite users by email
- **Real-time Participant Presence** — live participant list updates as users join and leave via Socket.io
- **Shared Study Timer** — any participant can start a timer that syncs across all clients instantly; late joiners snap to the correct elapsed time
- **Live Room Chat** — messages saved to MongoDB and broadcast in real time; chat history loads on room entry
- **Session Tracking** — every completed session is persisted with duration, participants, and timestamp
- **Session History & Stats** — per-user history page with total hours, session count, current streak, and longest session
- **Activity Dashboard** — stats overview, your rooms, and recent sessions on one screen
- **Settings** — update display name

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) · TypeScript |
| Styling | Tailwind CSS v4 |
| Server State | TanStack Query v5 (React Query) |
| Client State | Zustand |
| Real-time | Socket.io (client + server) |
| Backend | Node.js · Express.js |
| Database | MongoDB · Mongoose |
| Auth | JWT via httpOnly cookies |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## Deployment

### Backend → Render

1. Push `server/` to GitHub
2. Create a **Web Service** on [render.com](https://render.com)
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add env vars from `.env` in the Render dashboard
6. Enable **WebSocket Support** in service settings
7. Note your Render URL

### Frontend → Vercel

1. Import the repo on [vercel.com](https://vercel.com)
2. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-app.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://your-app.onrender.com
   ```
3. Deploy — Vercel auto-detects Next.js

> After deploying both, update `CLIENT_URL` in Render to your Vercel URL and redeploy the backend.
