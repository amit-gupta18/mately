# Mately ⚡

A real-time collaborative study room platform. Create virtual study rooms, study alongside others with a shared synced timer, chat live, invite teammates, and track your session history.

**Live:** [mately-delta.vercel.app](https://mately-delta.vercel.app)

---

## Project Setup

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (free M0 works)

### 1. Clone

```bash
git clone https://github.com/amit-gupta18/mately.git
cd mately
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env      # fill in your values
npm run dev               # → http://localhost:5000
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
npm run dev               # → http://localhost:3000
```

**`client/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Open `http://localhost:3000`, register, and you're in.

---

## Features

| Feature | Description |
|---|---|
| **Authentication** | Register / login / logout via JWT in httpOnly cookies; session persists across refreshes |
| **Study Rooms** | Create public or private rooms; browse all public rooms |
| **Invite Users** | Room owners can invite any registered user by email into private rooms |
| **Participant Presence** | Live participant list — updates instantly as users join or leave via Socket.io |
| **Shared Study Timer** | Any participant can start/pause/end a timer that syncs across all clients; late joiners snap to correct elapsed time |
| **Live Room Chat** | Real-time messages saved to MongoDB; full chat history loads on room entry |
| **Room Activity History** | Tabbed view inside each room showing all past sessions with duration, date, and participant count |
| **Session Tracking** | Every completed session persisted with duration, participants, room, and timestamp |
| **Session History & Stats** | Per-user history page with total hours, session count, streak, and longest session |
| **Activity Dashboard** | Stats overview, your rooms, and recent sessions at a glance |
| **Settings** | Update your display name |

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

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Vercel)                     │
│                                                      │
│  Next.js 16 App Router                               │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │    Pages /   │  │ React Query  │  │  Zustand  │  │
│  │  Components  │◄─│ (REST State) │  │  Stores   │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘  │
│         │                 │                │         │
│         ▼                 │                │         │
│  ┌──────────────┐         │           authStore      │
│  │  Socket.io   │         │           roomStore      │
│  │   Client     │         │           chatStore      │
│  │  /study ns   │         │           uiStore        │
│  └──────┬───────┘         │                          │
└─────────┼─────────────────┼──────────────────────────┘
          │ WebSocket        │ HTTPS fetch
          │ (persistent)     │ (credentials: include)
          ▼                 ▼
┌─────────────────────────────────────────────────────┐
│               SERVER (Render)                        │
│                                                      │
│   Express.js + Socket.io  (same process, port 5000) │
│                                                      │
│   REST /api/*              Socket.io /study          │
│   ├── /auth                ├── room:join/leave       │
│   ├── /rooms               ├── chat:message          │
│   ├── /sessions            ├── timer:start/pause/end │
│   └── /users               └── timer:sync_request   │
│                                                      │
│             Mongoose ODM                             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
        ┌──────────────────┐
        │   MongoDB Atlas   │
        │  users · rooms    │
        │  sessions · msgs  │
        └──────────────────┘
```

### Dual Channel Strategy

| Channel | Used For |
|---|---|
| **REST (fetch)** | Auth, room CRUD, session history, user profile — anything needing a response |
| **Socket.io** | Chat, timer sync, participant presence — anything pushed to multiple clients instantly |

---

## Authentication Flow

```
User submits login form
        │
        ▼
POST /api/auth/login
        │
        ▼
Server validates credentials
→ signs JWT (7d expiry)
→ res.cookie('token', jwt, { httpOnly, secure, sameSite })
→ returns user object (no token in body)
        │
        ▼
Client
→ Zustand authStore.setUser(user)
→ connectSocket()           ← Socket.io connects (sends cookie automatically)
→ redirect to /dashboard
        │
        ▼
Page Refresh
→ GET /api/auth/me fires on mount
→ server reads httpOnly cookie, returns user
→ Zustand rehydrates, socket reconnects

        ▼
Logout
→ POST /api/auth/logout
→ server clears cookie
→ disconnectSocket()
→ Zustand clearUser() + React Query cache cleared
→ redirect to /login
```

---

## Socket.io Event Flow

### Namespace: `/study`

All connections are authenticated via the JWT cookie in the Socket.io middleware before any event is processed.

```
Client connects to wss://server/study
        │
        ▼
Socket middleware reads httpOnly cookie
→ jwt.verify(token) → attaches user to socket.data
→ next() or reject with 'Unauthorized'
```

### Study Session Flow

```
User A opens room page
        │
  emit('room:join', { roomId })
  emit('timer:sync_request', { roomId })
        │
        ▼
Server
→ socket.join(roomId)
→ emit('room:participants_list', participants)   ← to A only
→ emit('room:participant_joined', { user: A })   ← broadcast to room
→ reads active session → emit('timer:sync', { elapsed, isRunning, startedAt })

─────────────────────────────────────────────────

User A starts timer
        │
  emit('timer:start', { roomId })
        │
        ▼
Server
→ Session.create({ room, startedBy, startedAt, status: 'active' })
→ io.to(roomId).emit('timer:started', { startedAt: Date.now(), startedBy })
        │
All clients receive 'timer:started'
→ roomStore.startTimer()
→ each client counts locally from startedAt (no polling)

─────────────────────────────────────────────────

User C joins mid-session
        │
  emit('timer:sync_request', { roomId })
        │
        ▼
Server
→ reads active Session from DB
→ elapsed = now − session.startedAt
→ socket.emit('timer:sync', { elapsed, isRunning: true, startedAt })
        │
User C's timer snaps to correct time ✓

─────────────────────────────────────────────────

User A ends session
        │
  emit('timer:end', { roomId })
        │
        ▼
Server
→ Session.findOne({ room, status: 'active' })
→ session.duration = endedAt − startedAt
→ session.status = 'completed'
→ io.to(roomId).emit('timer:ended', { sessionId, duration })
        │
All clients
→ roomStore.resetTimer()
→ SessionSummary modal opens
→ React Query invalidates ['sessions'] → history updates
```

### Chat Flow

```
User sends message
        │
  emit('chat:message', { roomId, text })
        │
        ▼
Server
→ verifies socket is in roomId
→ Message.create({ room, sender, text })
→ message.populate('sender', 'name avatar')
→ io.to(roomId).emit('chat:message', populatedMessage)
        │
All clients in room
→ chatStore.addMessage(msg)
→ ChatWindow re-renders, auto-scrolls
```

---

## Data Models

```
USER                          ROOM
──────────────────            ──────────────────────────
_id         ObjectId  ──┐     _id             ObjectId
name        String    │ ├──►  owner           ObjectId → User
email       String    │ ├──►  participants    ObjectId[]
password    String    │ │     isPrivate       Boolean
avatar      String    │ │     maxParticipants Number
createdAt   Date      │ │     invitedUsers    ObjectId[]
                      │ │     createdAt       Date
                      │ │
                      │ │     SESSION
                      │ │     ──────────────────────────
                      │ ├──►  room            ObjectId → Room
                      ├──►    startedBy       ObjectId → User
                      │       startedAt       Date
                      │       endedAt         Date
                      │       duration        Number (seconds)
                      ├──►    participants    ObjectId[]
                              status          active|completed|abandoned
                              createdAt       Date

MESSAGE
──────────────────────────
_id         ObjectId
room        ObjectId → Room
sender      ObjectId → User
text        String (max 500)
createdAt   Date
```

---

## File Structure

```
mately/
├── client/                         # Next.js 16 frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # AuthGuard + Sidebar + Header
│   │   │   └── dashboard/
│   │   │       ├── page.tsx        # Main dashboard
│   │   │       ├── rooms/
│   │   │       │   ├── page.tsx    # Browse rooms
│   │   │       │   └── [roomId]/page.tsx  # Active room
│   │   │       ├── history/page.tsx
│   │   │       └── settings/page.tsx
│   │   ├── layout.tsx              # Root layout + QueryProvider
│   │   └── page.tsx                # Landing page
│   ├── components/
│   │   ├── ui/                     # Button, Input, Modal, Badge, Avatar, Spinner
│   │   ├── layout/                 # Sidebar, Header, AuthGuard
│   │   ├── dashboard/              # RoomCard, RoomList, CreateRoomModal
│   │   ├── room/                   # StudyTimer, TimerControls, ChatWindow, ParticipantList, SessionSummary
│   │   ├── history/                # SessionCard, SessionList
│   │   └── landing/                # LandingCTA
│   ├── hooks/                      # useAuth, useRooms, useSessions, useUser
│   ├── socket/                     # socket.ts, useRoomSocket, useChatSocket, useTimerSocket
│   ├── store/                      # authStore, roomStore, chatStore, uiStore
│   ├── lib/                        # fetcher, queryClient, constants
│   ├── types/                      # user, room, message, session
│   └── utils/                      # formatDuration, formatDate, cn
│
└── server/                         # Express + Socket.io backend
    └── src/
        ├── config/db.ts
        ├── models/                 # User, Room, Session, Message
        ├── controllers/            # authController, roomController, sessionController, userController
        ├── routes/                 # authRoutes, roomRoutes, sessionRoutes, userRoutes
        ├── socket/                 # index.ts, roomHandlers, chatHandlers, timerHandlers
        ├── middleware/             # authMiddleware, errorMiddleware
        ├── utils/generateToken.ts
        └── index.ts                # Express + Socket.io entry point
```

---

## Deployment

### Backend → Render

1. Push to GitHub
2. Create a **Web Service** on [render.com](https://render.com)
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Add env vars (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`)
6. Enable **WebSocket Support** in service settings
7. Note your Render URL: `https://your-app.onrender.com`

### Frontend → Vercel

1. Import the repo on [vercel.com](https://vercel.com)
2. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-app.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://your-app.onrender.com
   ```
3. Deploy — Vercel auto-detects Next.js

> After both are live, update `CLIENT_URL` in Render to your Vercel URL and redeploy the backend. The `sameSite: 'none'` + `secure: true` cookie config is required for cross-origin auth between Vercel and Render.
