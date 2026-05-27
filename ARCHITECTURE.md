# Collaborative Study Room Platform — Architecture Document

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [File Structure](#file-structure)
5. [REST API Design](#rest-api-design)
6. [Socket.io Event Design](#socketio-event-design)
7. [Frontend Architecture](#frontend-architecture)
8. [State Management Strategy](#state-management-strategy)
9. [Authentication Flow](#authentication-flow)
10. [Data Models](#data-models)
11. [Schema Diagrams](#schema-diagrams)
12. [Environment Variables](#environment-variables)
13. [Deployment Architecture](#deployment-architecture)

---

## Project Overview

A web-based collaborative study room platform where users can create virtual study rooms, invite participants, track study sessions with a shared timer, communicate via real-time room chat, and view activity history. The platform creates a structured, distraction-free study environment with real-time collaboration powered by Socket.io.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Server State | React Query (TanStack Query v5) |
| Client State | Zustand |
| HTTP Client | Native `fetch` |
| Real-time | Socket.io (client + server) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT via httpOnly cookies |
| Frontend Hosting | Vercel |
| Backend Hosting | Render / Railway |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                         │
│                                                                  │
│   Next.js App (Vercel)                                           │
│                                                                  │
│   ┌──────────────┐   ┌───────────────┐   ┌───────────────────┐  │
│   │    Pages /   │   │  React Query  │   │      Zustand      │  │
│   │  Components  │◄──│  (REST State) │   │  (Client State)   │  │
│   │              │   │               │   │  - auth user      │  │
│   └──────┬───────┘   └───────┬───────┘   │  - active room    │  │
│          │                   │           │  - socket status  │  │
│          │                   │           │  - timer state    │  │
│          ▼                   │           │  - UI state       │  │
│   ┌──────────────┐           │           └───────────────────┘  │
│   │  Socket.io   │           │                                   │
│   │   Client     │           │                                   │
│   │  (real-time) │           │                                   │
│   └──────┬───────┘           │                                   │
└──────────┼────────────────── ┼───────────────────────────────────┘
           │                   │
           │ WebSocket          │ fetch() HTTPS
           │ (persistent)       │ (httpOnly cookie)
           ▼                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SERVER (Render / Railway)                      │
│                                                                  │
│   Express.js + Socket.io Server (same Node process)             │
│                                                                  │
│   ┌─────────────────┐        ┌──────────────────────────────┐   │
│   │   REST Routes   │        │       Socket.io Server       │   │
│   │  /api/auth      │        │                              │   │
│   │  /api/rooms     │        │  Namespaces: /study          │   │
│   │  /api/sessions  │        │                              │   │
│   │  /api/users     │        │  Events:                     │   │
│   └────────┬────────┘        │  - room:join / room:leave    │   │
│            │                 │  - chat:message              │   │
│            ▼                 │  - timer:start/pause/sync    │   │
│   ┌─────────────────┐        │  - participant:update        │   │
│   │   Controllers   │        │  - session:end               │   │
│   └────────┬────────┘        └──────────────┬───────────────┘   │
│            │                                │                    │
│            └──────────────┬─────────────────┘                   │
│                           ▼                                      │
│                  ┌─────────────────┐                             │
│                  │    Mongoose     │                             │
│                  │    Models       │                             │
│                  └────────┬────────┘                            │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │      MongoDB Atlas       │
              │                         │
              │  Collections:           │
              │  - users                │
              │  - rooms                │
              │  - sessions             │
              │  - messages             │
              └─────────────────────────┘
```

### Dual Channel Strategy

The architecture uses two communication channels deliberately:

| Channel | Used For |
|---------|----------|
| REST (fetch) | Auth, room CRUD, session history, user management — anything that needs persistence and a response |
| Socket.io | Chat messages, timer sync, participant presence, live room updates — anything that needs to be pushed to multiple clients instantly |

### Request Lifecycle — REST

```
User Action (e.g. Create Room)
    │
    ▼
React Query useMutation
    │
    ▼
fetch() POST /api/rooms  { credentials: 'include' }
    │
    ▼
Auth Middleware (reads JWT from httpOnly cookie)
    │
    ▼
Room Controller → Mongoose → MongoDB
    │
    ▼
201 Response → React Query cache update → UI re-render
```

### Request Lifecycle — Socket.io

```
User Action (e.g. Send Chat Message)
    │
    ▼
Zustand reads activeRoom, user
    │
    ▼
socket.emit('chat:message', { roomId, text })
    │
    ▼
Socket.io Server receives event
→ validates sender is in room
→ saves message to MongoDB
→ io.to(roomId).emit('chat:message', messagePayload)
    │
    ▼
All clients in room receive event
→ Zustand updates chat messages array
→ UI re-renders chat window
```

---

## File Structure

### Frontend (Next.js)

```
study-room-client/
├── public/
│   └── icons/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/                       # Route group — no layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/                  # Route group — sidebar layout
│   │   │   ├── layout.tsx                # Dashboard shell
│   │   │   ├── page.tsx                  # /dashboard — room list
│   │   │   ├── rooms/
│   │   │   │   ├── page.tsx              # Browse / create rooms
│   │   │   │   └── [roomId]/
│   │   │   │       └── page.tsx          # Active study room view
│   │   │   ├── history/
│   │   │   │   └── page.tsx              # Session history + stats
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── layout.tsx                    # Root layout (providers)
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                           # Base reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── dashboard/
│   │   │   ├── RoomCard.tsx              # Room preview card
│   │   │   ├── RoomList.tsx              # Grid of RoomCards
│   │   │   ├── ActivityDashboard.tsx     # Stats: total hours, sessions
│   │   │   └── CreateRoomModal.tsx
│   │   ├── room/                         # Active room view components
│   │   │   ├── RoomHeader.tsx            # Room name, participants count
│   │   │   ├── ParticipantList.tsx       # Live participant presence
│   │   │   ├── ParticipantAvatar.tsx
│   │   │   ├── StudyTimer.tsx            # Shared session timer
│   │   │   ├── TimerControls.tsx         # Start / Pause / End
│   │   │   ├── ChatWindow.tsx            # Real-time chat
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── SessionSummary.tsx        # Shown when session ends
│   │   └── history/
│   │       ├── SessionList.tsx
│   │       └── SessionCard.tsx
│   │
│   ├── hooks/                            # React Query hooks
│   │   ├── useAuth.ts                    # login, register, logout, /me
│   │   ├── useRooms.ts                   # CRUD rooms, join/leave
│   │   ├── useSessions.ts               # session history, stats
│   │   └── useUser.ts                    # user profile
│   │
│   ├── socket/
│   │   ├── socket.ts                     # Socket.io client instance (singleton)
│   │   ├── useSocket.ts                  # hook to access socket + connection state
│   │   ├── useRoomSocket.ts              # room-specific socket events
│   │   ├── useChatSocket.ts              # chat events
│   │   └── useTimerSocket.ts             # timer sync events
│   │
│   ├── store/                            # Zustand stores
│   │   ├── authStore.ts                  # user object (no token)
│   │   ├── roomStore.ts                  # active room, participants, timer state
│   │   ├── chatStore.ts                  # chat messages array for active room
│   │   └── uiStore.ts                    # modals, sidebar state
│   │
│   ├── lib/
│   │   ├── fetcher.ts                    # fetch wrapper (credentials: include)
│   │   ├── queryClient.ts                # TanStack QueryClient instance
│   │   └── constants.ts                  # API URL, query keys, socket events
│   │
│   ├── types/
│   │   ├── room.ts
│   │   ├── session.ts
│   │   ├── message.ts
│   │   ├── user.ts
│   │   └── socket.ts                     # socket event payload types
│   │
│   └── utils/
│       ├── formatDuration.ts             # seconds → "1h 23m"
│       ├── formatDate.ts
│       └── cn.ts                         # Tailwind class merge
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Backend (Express + Socket.io)

```
study-room-server/
├── src/
│   ├── config/
│   │   └── db.ts                         # MongoDB connection
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Room.ts
│   │   ├── Session.ts
│   │   └── Message.ts
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── roomController.ts
│   │   ├── sessionController.ts
│   │   └── userController.ts
│   │
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── roomRoutes.ts
│   │   ├── sessionRoutes.ts
│   │   └── userRoutes.ts
│   │
│   ├── socket/
│   │   ├── index.ts                      # Socket.io server init, auth middleware
│   │   ├── roomHandlers.ts               # room:join, room:leave events
│   │   ├── chatHandlers.ts               # chat:message events
│   │   └── timerHandlers.ts              # timer:start, timer:pause, timer:sync
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts             # JWT verify for REST routes
│   │   └── errorMiddleware.ts
│   │
│   ├── utils/
│   │   └── generateToken.ts
│   │
│   └── index.ts                          # Express + Socket.io entry point
│
├── .env
├── tsconfig.json
└── package.json
```

---

## REST API Design

### Base URL

```
Development:  http://localhost:5000/api
Production:   https://your-backend.render.com/api
```

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Create account | No |
| POST | `/auth/login` | Login, set cookie | No |
| POST | `/auth/logout` | Clear cookie | Yes |
| GET | `/auth/me` | Get current user | Yes |

**POST /auth/login**
```json
// Request
{ "email": "john@example.com", "password": "securepassword" }

// Response 200 — sets httpOnly cookie, returns user only (no token in body)
{
  "success": true,
  "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

---

### Room Routes — `/api/rooms`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/rooms` | Get all public rooms + user's rooms | Yes |
| POST | `/rooms` | Create a new room | Yes |
| GET | `/rooms/:id` | Get room details + participants | Yes |
| PUT | `/rooms/:id` | Update room (owner only) | Yes |
| DELETE | `/rooms/:id` | Delete room (owner only) | Yes |
| POST | `/rooms/:id/invite` | Invite a user by email | Yes |

**POST /rooms**
```json
// Request
{
  "name": "DSA Prep — LeetCode Grind",
  "description": "Daily practice session",
  "isPrivate": false,
  "maxParticipants": 10
}

// Response 201
{
  "success": true,
  "room": {
    "_id": "...",
    "name": "DSA Prep — LeetCode Grind",
    "description": "Daily practice session",
    "isPrivate": false,
    "maxParticipants": 10,
    "owner": { "_id": "...", "name": "John Doe" },
    "participants": [],
    "createdAt": "..."
  }
}
```

---

### Session Routes — `/api/sessions`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/sessions` | Get current user's session history | Yes |
| GET | `/sessions/room/:roomId` | Get all sessions for a room | Yes |
| GET | `/sessions/stats` | Aggregate stats (total hours, streak) | Yes |

**GET /sessions/stats**
```json
// Response 200
{
  "success": true,
  "data": {
    "totalSessions": 24,
    "totalMinutes": 1440,
    "totalHours": 24,
    "currentStreak": 5,
    "longestSession": 120
  }
}
```

---

### User Routes — `/api/users`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/search?q=email` | Search user by email (for invite) | Yes |
| PUT | `/users/profile` | Update name / avatar | Yes |

---

## Socket.io Event Design

### Connection & Authentication

```
Client connects to:  wss://your-backend.render.com  (namespace: /study)

Socket.io auth middleware on server reads the JWT from the
handshake cookie (same httpOnly cookie as REST):

io.use((socket, next) => {
  const token = socket.request.cookies.token;
  if (!token) return next(new Error('Unauthorized'));
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.data.user = decoded;
  next();
});
```

### Client → Server Events (Emit)

| Event | Payload | Description |
|-------|---------|-------------|
| `room:join` | `{ roomId }` | Join a study room's Socket.io room |
| `room:leave` | `{ roomId }` | Leave a study room |
| `chat:message` | `{ roomId, text }` | Send a chat message |
| `timer:start` | `{ roomId }` | Start the shared session timer |
| `timer:pause` | `{ roomId }` | Pause the timer |
| `timer:end` | `{ roomId }` | End session, persist to DB |
| `timer:sync_request` | `{ roomId }` | New joiner requests current timer state |

### Server → Client Events (Broadcast)

| Event | Payload | Description |
|-------|---------|-------------|
| `room:participant_joined` | `{ user, participantCount }` | Broadcast when someone joins |
| `room:participant_left` | `{ userId, participantCount }` | Broadcast when someone leaves |
| `room:participants_list` | `{ participants[] }` | Full list on join |
| `chat:message` | `{ _id, sender, text, createdAt }` | Broadcast message to room |
| `timer:started` | `{ startedAt, startedBy }` | Timer started broadcast |
| `timer:paused` | `{ elapsed }` | Timer paused broadcast |
| `timer:sync` | `{ elapsed, isRunning, startedAt }` | Sync state for new joiners |
| `timer:ended` | `{ sessionId, duration }` | Session ended, links to saved session |
| `error` | `{ message }` | Socket-level error |

### Socket Event Flow — Study Session

```
User A opens room page
    │
    ▼
socket.emit('room:join', { roomId })
    │
    ▼
Server: socket.join(roomId)
→ fetch current participants from DB
→ socket.emit('room:participants_list', participants)
→ io.to(roomId).emit('room:participant_joined', { user: A })
    │
    ▼
User B (already in room) receives 'room:participant_joined'
→ Zustand roomStore updates participants list
→ ParticipantList re-renders

─────────────────────────────────────────

User A starts timer
    │
    ▼
socket.emit('timer:start', { roomId })
    │
    ▼
Server:
→ create Session document { room, startedBy, startedAt, status: 'active' }
→ io.to(roomId).emit('timer:started', { startedAt, startedBy })
    │
    ▼
All clients receive 'timer:started'
→ Zustand timerState = { isRunning: true, startedAt, elapsed: 0 }
→ StudyTimer starts local countdown (no polling — each client counts locally)

─────────────────────────────────────────

User C joins mid-session
    │
    ▼
socket.emit('room:join', { roomId })
socket.emit('timer:sync_request', { roomId })
    │
    ▼
Server:
→ reads active session from DB
→ calculates elapsed = now - session.startedAt
→ socket.emit('timer:sync', { elapsed, isRunning: true, startedAt })
    │
    ▼
User C's timer snaps to correct elapsed time

─────────────────────────────────────────

User A ends session
    │
    ▼
socket.emit('timer:end', { roomId })
    │
    ▼
Server:
→ update Session { endedAt: now, duration: elapsed, status: 'completed' }
→ io.to(roomId).emit('timer:ended', { sessionId, duration })
    │
    ▼
All clients receive 'timer:ended'
→ Zustand resets timer
→ SessionSummary modal shows duration
→ React Query invalidates ['sessions'] so history updates
```

### Socket.io Client Singleton

```typescript
// socket/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,    // sends httpOnly cookie for auth
      autoConnect: false,       // connect manually after login
      namespace: '/study',
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

---

## Frontend Architecture

### Page → Component → Hook/Socket Flow

```
/rooms/[roomId]/page.tsx
  ├── useRooms(roomId)              ← React Query: fetch room details (REST)
  ├── useRoomSocket(roomId)         ← Socket.io: participants, presence
  ├── useTimerSocket(roomId)        ← Socket.io: timer sync
  │
  ├── RoomHeader
  │     └── reads roomStore (Zustand)
  ├── ParticipantList
  │     └── reads roomStore.participants (Zustand, updated by socket)
  ├── StudyTimer
  │     └── reads roomStore.timer (Zustand, updated by socket)
  ├── TimerControls
  │     └── socket.emit('timer:start' | 'timer:pause' | 'timer:end')
  └── ChatWindow
        ├── useChatSocket(roomId)   ← Socket.io: incoming messages
        ├── reads chatStore.messages (Zustand)
        └── ChatInput → socket.emit('chat:message', ...)
```

### React Query Keys Convention

```typescript
export const QUERY_KEYS = {
  me:      () => ['auth', 'me'],
  rooms:   () => ['rooms'],
  room:    (id: string) => ['rooms', id],
  sessions: () => ['sessions'],
  sessionsByRoom: (roomId: string) => ['sessions', 'room', roomId],
  stats:   () => ['sessions', 'stats'],
};
```

---

## State Management Strategy

### React Query — Server State

| Hook | Manages |
|------|---------|
| `useAuth` | Login/register mutations, `/me` query |
| `useRooms` | Fetch room list, create, update, delete room |
| `useSessions` | Session history, aggregate stats |
| `useUser` | Profile update |

### Zustand — Client State

**`authStore.ts`**
```typescript
// user: { _id, name, email } | null
// setUser(), clearUser()
// No token — lives in httpOnly cookie only
```

**`roomStore.ts`**
```typescript
// activeRoomId: string | null
// participants: User[]             ← updated by socket events
// timer: {
//   isRunning: boolean
//   startedAt: number | null       ← unix timestamp
//   elapsed: number                ← seconds
//   pausedAt: number | null
// }
// setParticipants(), addParticipant(), removeParticipant()
// startTimer(), pauseTimer(), syncTimer(), resetTimer()
```

**`chatStore.ts`**
```typescript
// messages: Message[]              ← appended by socket events
// addMessage(), clearMessages()
```

**`uiStore.ts`**
```typescript
// isCreateRoomModalOpen: boolean
// isSessionSummaryOpen: boolean
// lastSessionDuration: number | null
```

---

## Authentication Flow

```
Register / Login
      │
      ▼
POST /api/auth/login  { credentials: 'include' }
      │
      ▼
Server validates credentials
→ generates JWT (expires in 7d)
→ res.cookie('token', jwt, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',       // cross-origin: Vercel ↔ Render
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
→ returns user object in body (no token)
      │
      ▼
Frontend
→ Zustand authStore.setUser(user)
→ getSocket().connect()           // Socket.io connects (sends cookie)
→ redirect to /dashboard
      │
      ▼
Page Refresh
→ GET /auth/me fires on app mount
→ server reads cookie, returns user
→ Zustand rehydrates
→ Socket.io reconnects
      │
      ▼
Logout
→ POST /api/auth/logout
→ server res.clearCookie('token')
→ disconnectSocket()
→ Zustand clearUser()
→ React Query clear cache
→ redirect to /login
```

### Express Setup

```typescript
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);         // shared http server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  }
});

app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Socket.io auth middleware
io.use((socket, next) => {
  const token = socket.request.cookies?.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    socket.data.user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    next(new Error('Token invalid'));
  }
});
```

> **Key point:** Express and Socket.io share the **same HTTP server** — one process, one port, one deployment on Render.

---

## Data Models

### User
```typescript
{
  _id:       ObjectId,
  name:      string,
  email:     string,       // unique
  password:  string,       // bcrypt hashed
  avatar:    string,       // optional URL or initials fallback
  createdAt: Date
}
```

### Room
```typescript
{
  _id:             ObjectId,
  name:            string,
  description:     string,
  owner:           ObjectId,   // ref: User
  participants:    ObjectId[], // ref: User — persisted members (not just online)
  isPrivate:       boolean,
  maxParticipants: number,
  invitedUsers:    ObjectId[], // ref: User — for private rooms
  createdAt:       Date
}
```

### Session
```typescript
{
  _id:        ObjectId,
  room:       ObjectId,   // ref: Room
  startedBy:  ObjectId,   // ref: User
  startedAt:  Date,
  endedAt:    Date,
  duration:   number,     // in seconds
  participants: ObjectId[], // ref: User — who was present
  status:     'active' | 'completed' | 'abandoned',
  createdAt:  Date
}
```

### Message
```typescript
{
  _id:       ObjectId,
  room:      ObjectId,   // ref: Room
  sender:    ObjectId,   // ref: User
  text:      string,
  createdAt: Date
}
```

---

## Schema Diagrams

### Entity Relationship Diagram (ERD)

```
┌──────────────────────────────┐
│            USER              │
├──────────────────────────────┤
│ _id        : ObjectId (PK)   │
│ name       : String          │
│ email      : String (unique) │
│ password   : String (hashed) │
│ avatar     : String          │
│ createdAt  : Date            │
└──────┬───────────────────────┘
       │
       │ 1
       │ owns
       ▼ many
┌──────────────────────────────┐         ┌──────────────────────────┐
│            ROOM              │ 1    ∞  │         SESSION          │
├──────────────────────────────┤─────────┤──────────────────────────┤
│ _id            : ObjectId(PK)│         │ _id       : ObjectId(PK) │
│ name           : String      │         │ room      : ObjectId(FK) │──► Room
│ description    : String      │         │ startedBy : ObjectId(FK) │──► User
│ owner          : ObjectId(FK)│──► User │ startedAt : Date         │
│ participants   : ObjectId[]  │──► User │ endedAt   : Date         │
│ isPrivate      : Boolean     │         │ duration  : Number       │
│ maxParticipants: Number      │         │ participants: ObjectId[] │──► User
│ invitedUsers   : ObjectId[]  │──► User │ status    : String       │
│ createdAt      : Date        │         │ createdAt : Date         │
└──────────────────────────────┘         └──────────────────────────┘
       │
       │ 1
       │ has
       ▼ many
┌──────────────────────────────┐
│           MESSAGE            │
├──────────────────────────────┤
│ _id       : ObjectId (PK)    │
│ room      : ObjectId (FK)    │──► Room
│ sender    : ObjectId (FK)    │──► User
│ text      : String           │
│ createdAt : Date             │
└──────────────────────────────┘
```

---

### User Schema

```
USER
├── _id        ObjectId      Primary key, auto-generated
├── name       String        Required, trimmed
├── email      String        Required, unique, lowercase
├── password   String        Required, bcrypt hashed
├── avatar     String        Optional, URL or initials key
└── createdAt  Date          Auto (timestamps: true)
```

---

### Room Schema

```
ROOM
├── _id             ObjectId      Primary key
├── name            String        Required, trimmed, max: 100
├── description     String        Optional, max: 300
├── owner           ObjectId ───► ref: 'User'
├── participants    ObjectId[] ──► ref: 'User'   (persisted members)
├── isPrivate       Boolean       Default: false
├── maxParticipants Number        Default: 20, min: 2
├── invitedUsers    ObjectId[] ──► ref: 'User'   (private room invites)
└── createdAt       Date          Auto (timestamps: true)

Index: { name: 'text' }  →  text search on room name
```

---

### Session Schema

```
SESSION
├── _id          ObjectId      Primary key
├── room         ObjectId ───► ref: 'Room'
├── startedBy    ObjectId ───► ref: 'User'
├── startedAt    Date          Required
├── endedAt      Date          Set on session end
├── duration     Number        Seconds, set on session end
├── participants ObjectId[] ──► ref: 'User'   (snapshot of who was present)
├── status       String        Enum: ['active', 'completed', 'abandoned']
└── createdAt    Date          Auto (timestamps: true)

Index: { room: 1, createdAt: -1 }   →  fast room history queries
Index: { startedBy: 1, status: 1 }  →  fast user history queries
```

---

### Message Schema

```
MESSAGE
├── _id       ObjectId      Primary key
├── room      ObjectId ───► ref: 'Room'
├── sender    ObjectId ───► ref: 'User'
├── text      String        Required, max: 500
└── createdAt Date          Auto (timestamps: true)

Index: { room: 1, createdAt: 1 }   →  fast chat history pagination
```

---

### Schema Relationships Map

```
                   ┌──────────────┐
                   │     USER     │
                   │  _id (PK)    │
                   └──────┬───────┘
                          │
         ┌────────────────┼────────────────┬─────────────────┐
         │                │                │                 │
         │ owner          │ participants   │ startedBy       │ sender
         ▼                ▼                ▼                 ▼
   ┌───────────┐    ┌───────────┐    ┌──────────┐    ┌──────────────┐
   │   ROOM    │    │   ROOM    │    │ SESSION  │    │   MESSAGE    │
   │           │───►│           │───►│          │    │              │
   └─────┬─────┘    └───────────┘    └──────────┘    └──────────────┘
         │                                  ▲
         │ room (FK)                        │ room (FK)
         └──────────────────────────────────┘

Relationship Summary:
  User   1 ──── ∞  Room        (user owns many rooms)
  User   ∞ ──── ∞  Room        (user participates in many rooms)
  Room   1 ──── ∞  Session     (room has many sessions over time)
  Room   1 ──── ∞  Message     (room has many chat messages)
  User   1 ──── ∞  Session     (user starts many sessions)
  User   1 ──── ∞  Message     (user sends many messages)
```

---

### Mongoose Populate Paths

```typescript
// Room detail page
Room.findById(roomId)
  .populate('owner',        'name avatar')
  .populate('participants', 'name avatar')

// Session history
Session.find({ startedBy: userId })
  .populate('room',         'name')
  .populate('participants', 'name avatar')
  .sort({ createdAt: -1 })

// Chat messages (paginated, newest last)
Message.find({ room: roomId })
  .populate('sender', 'name avatar')
  .sort({ createdAt: 1 })
  .limit(50)
```

---

## Environment Variables

### Frontend — `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Backend — `.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/study-room
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-app.vercel.app
```

> **Never commit `.env` files. Add to `.gitignore` immediately.**

---

## Deployment Architecture

```
┌─────────────────────┐          ┌────────────────────────────┐
│       Vercel        │          │      Render / Railway       │
│                     │  HTTPS   │                             │
│   Next.js App       │─────────►│  Express + Socket.io        │
│   (frontend)        │          │  (single process, 1 port)   │
│                     │  WSS     │                             │
│                     │─────────►│  Same server handles:       │
│  Env:               │          │  - REST /api/*              │
│  API_URL=render     │          │  - WebSocket upgrades       │
│  SOCKET_URL=render  │          │                             │
│                     │          │  Env:                       │
└─────────────────────┘          │  MONGODB_URI, JWT_SECRET    │
                                 │  CLIENT_URL=vercel url      │
                                 └──────────────┬──────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────┐
                                 │      MongoDB Atlas        │
                                 │      (free M0 cluster)    │
                                 └──────────────────────────┘
```

**Important deployment notes:**

- Express and Socket.io share **one port** on Render — no separate WebSocket server needed
- Set `NEXT_PUBLIC_SOCKET_URL` to the same Render URL as your API (no `/api` suffix)
- On Render, enable **"WebSocket Support"** in the service settings or it will block WS upgrades
- `sameSite: 'none'` + `secure: true` on the cookie is mandatory for cross-origin cookie to work between Vercel and Render
- Socket.io client uses `withCredentials: true` so the cookie is sent on the WebSocket handshake too