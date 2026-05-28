# Collaborative Study Room Platform — Implementation Plan

## Overview

This document breaks the entire project into sequential phases. Each phase is
self-contained — it produces working, testable output before you move to the
next one. Never skip a phase. Every phase builds directly on the previous one.

**Golden Rule:** At the end of every phase, the app must run without errors.
Do not carry broken code into the next phase.

---

## Phase Map

```
Phase 1 → Project Setup & Scaffolding
Phase 2 → Backend Foundation (Express + MongoDB + Auth)
Phase 3 → Frontend Foundation (Next.js + Auth UI)
Phase 4 → Room Management (REST — CRUD)
Phase 5 → Socket.io Integration (Real-time Foundation)
Phase 6 → Real-time Chat
Phase 7 → Study Timer (Shared + Synced)
Phase 8 → Session Tracking & History
Phase 9 → Activity Dashboard
Phase 10 → Deployment
```

---

## Phase 1 — Project Setup & Scaffolding

> **STATUS: COMPLETE** — Backend scaffolded and running. Frontend Next.js project exists. Frontend providers (React Query, Zustand) not yet wired up.

**Goal:** Both projects (client + server) exist, run locally, and talk to each other.

### 1.1 — Create Backend Project

```bash
mkdir study-room-server && cd study-room-server
npm init -y
npm install express mongoose dotenv cors cookie-parser jsonwebtoken bcryptjs socket.io cookie
npm install -D typescript ts-node nodemon @types/express @types/node @types/cors @types/cookie-parser @types/jsonwebtoken @types/bcryptjs @types/cookie
npx tsc --init
```

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

Create `nodemon.json`:
```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/index.ts"
}
```

Add to `package.json`:
```json
"scripts": {
  "dev": "nodemon",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

### 1.2 — Create Frontend Project

```bash
npx create-next-app@latest study-room-client \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias

cd study-room-client
npm install @tanstack/react-query @tanstack/react-query-devtools zustand socket.io-client
```

### 1.3 — Create Folder Structures

**Backend — create all folders:**
```bash
mkdir -p src/{config,models,controllers,routes,socket,middleware,utils}
```

**Frontend — create all folders:**
```bash
mkdir -p src/{components/{ui,layout,dashboard,room,history},hooks,socket,store,lib,types,utils}
```

### 1.4 — Environment Files

**Backend — `src/.env`:**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/study-room
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

**Frontend — `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 1.5 — Backend Entry Point

Create `src/index.ts` with a basic Express + Socket.io server:
```typescript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

io.on('connection', (socket) => {
  console.log('socket connected:', socket.id);
});

connectDB().then(() => {
  httpServer.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
```

Create `src/config/db.ts`:
```typescript
import mongoose from 'mongoose';

export const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI!);
  console.log(`MongoDB connected: ${conn.connection.host}`);
};
```

### 1.6 — Frontend Providers Setup

Wrap the app with React Query and set up the root layout:

`src/app/layout.tsx` — add `QueryClientProvider` and `ReactQueryDevtools`.

Create `src/lib/queryClient.ts`:
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,   // 1 minute
    }
  }
});
```

### ✅ Phase 1 Checklist
- [x] `npm run dev` starts backend on port 5000 with no errors
- [x] `GET http://localhost:5000/api/health` returns `{ status: 'ok' }`
- [x] MongoDB connects successfully (check console log)
- [ ] `npm run dev` starts frontend on port 3000 with no errors
- [ ] Next.js default page loads in browser

---

## Phase 2 — Backend Auth

> **STATUS: COMPLETE (backend)** — All models, controllers, routes, and middleware implemented. Endpoints not yet tested via REST client.

**Goal:** Register, login, logout, and `/me` endpoints fully working with JWT httpOnly cookies.

### 2.1 — User Model

Create `src/models/User.ts`:
```typescript
import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  matchPassword(entered: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar:   { type: String }
}, { timestamps: true });

// hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare passwords
userSchema.methods.matchPassword = async function (entered: string) {
  return bcrypt.compare(entered, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
```

### 2.2 — Generate Token Utility

Create `src/utils/generateToken.ts`:
```typescript
import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateTokenAndSetCookie = (res: Response, userId: string) => {
  const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as string
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
  });

  return token;
};
```

> **Note:** `sameSite: 'lax'` in development (same origin), `'none'` in production
> (cross-origin Vercel ↔ Render). This avoids cookie issues during local dev.

### 2.3 — Auth Middleware

Create `src/middleware/authMiddleware.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };
    const user = await User.findById(decoded._id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    (req as any).user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};
```

### 2.4 — Auth Controller

Create `src/controllers/authController.ts` with four functions:
- `register` — validate, create user, set cookie, return user
- `login` — find user, match password, set cookie, return user
- `logout` — clear cookie
- `getMe` — return `req.user`

### 2.5 — Auth Routes

Create `src/routes/authRoutes.ts` and register in `src/index.ts`:
```typescript
app.use('/api/auth', authRoutes);
```

### 2.6 — Error Middleware

Create `src/middleware/errorMiddleware.ts` — global error handler, register last in `index.ts`.

### ✅ Phase 2 Checklist
Test every endpoint with a REST client (Postman / Thunder Client / curl):
- [ ] `POST /api/auth/register` creates user, sets cookie, returns user object
- [ ] `POST /api/auth/login` sets cookie, returns user object
- [ ] `GET /api/auth/me` with cookie returns user (without password)
- [ ] `GET /api/auth/me` without cookie returns 401
- [ ] `POST /api/auth/logout` clears cookie
- [ ] Passwords are hashed in MongoDB (check Atlas)

> **Files implemented:** `src/models/User.ts`, `src/utils/generateToken.ts`, `src/middleware/authMiddleware.ts`, `src/controllers/authController.ts`, `src/routes/authRoutes.ts`, `src/middleware/errorMiddleware.ts`

---

## Phase 3 — Frontend Auth

> **STATUS: COMPLETE** — Login/register pages, useAuth hook, Zustand authStore, AuthGuard, QueryProvider all implemented.

**Goal:** Register and login pages working, user persisted in Zustand, protected routes working.

### 3.1 — Types

Create `src/types/user.ts`:
```typescript
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
}
```

Create `src/types/api.ts`:
```typescript
export interface ApiError {
  success: false;
  message: string;
}
```

### 3.2 — Fetcher

Create `src/lib/fetcher.ts`:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetcher = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return res.json();
};
```

### 3.3 — Auth Store

Create `src/store/authStore.ts`:
```typescript
import { create } from 'zustand';
import { User } from '@/types/user';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (val: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,        // true on app load until /me resolves
  setUser: (user) => set({ user, isLoading: false }),
  clearUser: () => set({ user: null, isLoading: false }),
  setLoading: (val) => set({ isLoading: val }),
}));
```

### 3.4 — useAuth Hook

Create `src/hooks/useAuth.ts` — wraps login, register, logout mutations and
the `GET /auth/me` query. On app mount, `useAuth` fires `/me` to rehydrate
the user from the cookie. On success it calls `setUser`. On failure (401) it
calls `clearUser`.

### 3.5 — Auth Pages

Build `src/app/(auth)/login/page.tsx` and `src/app/(auth)/register/page.tsx`:
- Email + password form
- Calls `useAuth` mutations
- On success redirects to `/dashboard`
- Shows error messages inline

### 3.6 — Auth Guard

Create `src/components/layout/AuthGuard.tsx` — wraps dashboard routes.
If `isLoading` is true, show a spinner. If `user` is null, redirect to `/login`.
If `user` exists, render children.

Wrap `src/app/(dashboard)/layout.tsx` with `AuthGuard`.

### 3.7 — UI Store + Basic UI Components

Create `src/store/uiStore.ts` (modal states).

Build base UI components in `src/components/ui/`:
- `Button.tsx` — variants: primary, secondary, danger, ghost
- `Input.tsx` — with label and error state
- `Spinner.tsx`
- `Modal.tsx` — portal-based overlay

### ✅ Phase 3 Checklist
- [ ] `/register` creates account and redirects to `/dashboard`
- [ ] `/login` logs in and redirects to `/dashboard`
- [ ] Visiting `/dashboard` while logged out redirects to `/login`
- [ ] Refreshing the page keeps the user logged in (cookie rehydrates via `/me`)
- [ ] Logout clears session and redirects to `/login`
- [ ] Form validation shows inline errors

---

## Phase 4 — Room Management (REST)

> **STATUS: COMPLETE** — Room types, useRooms hooks, RoomCard/RoomList/CreateRoomModal components, dashboard and rooms pages all implemented.

**Goal:** Users can create, browse, view, and delete study rooms. No real-time yet — pure REST.

### 4.1 — Room Model (Backend)

Create `src/models/Room.ts`:
```typescript
const roomSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true, maxlength: 100 },
  description:     { type: String, trim: true, maxlength: 300 },
  owner:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPrivate:       { type: Boolean, default: false },
  maxParticipants: { type: Number, default: 20, min: 2 },
  invitedUsers:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

roomSchema.index({ name: 'text' });
```

### 4.2 — Room Controller (Backend)

Create `src/controllers/roomController.ts` with:
- `getRooms` — return all public rooms + rooms user owns or is a participant in
- `createRoom` — create room, add creator as owner and first participant
- `getRoomById` — return room with populated owner and participants
- `updateRoom` — owner only, update name/description/privacy
- `deleteRoom` — owner only
- `inviteUser` — find user by email, add to `invitedUsers`

### 4.3 — Room Routes (Backend)

Create `src/routes/roomRoutes.ts`, all routes protected with `protect` middleware.
Register in `index.ts`:
```typescript
app.use('/api/rooms', roomRoutes);
```

### 4.4 — Room Types (Frontend)

Create `src/types/room.ts`:
```typescript
export interface Room {
  _id: string;
  name: string;
  description?: string;
  owner: { _id: string; name: string; avatar?: string };
  participants: { _id: string; name: string; avatar?: string }[];
  isPrivate: boolean;
  maxParticipants: number;
  createdAt: string;
}
```

### 4.5 — useRooms Hook (Frontend)

Create `src/hooks/useRooms.ts`:
- `useGetRooms()` — `useQuery` fetching `GET /api/rooms`
- `useGetRoom(id)` — `useQuery` fetching `GET /api/rooms/:id`
- `useCreateRoom()` — `useMutation`, on success invalidates `['rooms']`
- `useDeleteRoom()` — `useMutation`, on success invalidates `['rooms']`
- `useInviteUser()` — `useMutation`

### 4.6 — Room Pages & Components (Frontend)

Build `src/app/(dashboard)/page.tsx` — the main dashboard:
- Shows list of rooms the user is in or has created
- "Create Room" button opens `CreateRoomModal`

Build `src/app/(dashboard)/rooms/page.tsx` — browse all public rooms.

Build components:
- `src/components/dashboard/RoomCard.tsx` — shows name, participant count,
  owner, privacy badge. Clicking navigates to `/rooms/[roomId]`
- `src/components/dashboard/RoomList.tsx` — grid of RoomCards with loading
  skeleton and empty state
- `src/components/dashboard/CreateRoomModal.tsx` — form: name, description,
  private toggle, max participants

Build `src/app/(dashboard)/rooms/[roomId]/page.tsx` — room detail page
(placeholder for now, just shows room name and participant list from REST).

### 4.7 — Sidebar & Layout

Build `src/components/layout/Sidebar.tsx` — navigation links:
- Dashboard (/)
- Browse Rooms (/rooms)
- History (/history)
- Settings (/settings)

Build `src/components/layout/Header.tsx` — user avatar, name, logout button.

### ✅ Phase 4 Checklist
- [ ] Dashboard shows all rooms user belongs to
- [ ] Browse Rooms page shows all public rooms
- [ ] Create Room modal works, new room appears in list
- [ ] Clicking a room navigates to `/rooms/[roomId]`
- [ ] Room detail page shows room name, description, participants
- [ ] Delete room works (owner only)
- [ ] Loading skeletons show while data fetches
- [ ] Empty state shows when no rooms exist

---

## Phase 5 — Socket.io Integration (Foundation)

> **STATUS: COMPLETE** — socket singleton, useRoomSocket, roomStore with participants all implemented.

**Goal:** Socket.io is connected, authenticated, and rooms can be joined/left in real-time.
Participant list updates live. This is the foundation every real-time feature builds on.

### 5.1 — Socket.io Auth Middleware (Backend)

Update `src/socket/index.ts` to add auth middleware:
```typescript
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

io.use((socket, next) => {
  const cookieHeader = socket.request.headers.cookie;
  if (!cookieHeader) return next(new Error('Unauthorized'));

  const cookies = cookie.parse(cookieHeader);
  if (!cookies.token) return next(new Error('Unauthorized'));

  try {
    const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET!) as any;
    socket.data.user = decoded;
    next();
  } catch {
    next(new Error('Token invalid'));
  }
});
```

### 5.2 — Room Socket Handlers (Backend)

Create `src/socket/roomHandlers.ts`:
```typescript
export const registerRoomHandlers = (io: Server, socket: Socket) => {
  // join room
  socket.on('room:join', async ({ roomId }) => {
    await socket.join(roomId);
    const socketsInRoom = await io.in(roomId).fetchSockets();
    const participants = socketsInRoom.map(s => s.data.user);
    socket.emit('room:participants_list', { participants });
    socket.to(roomId).emit('room:participant_joined', {
      user: socket.data.user
    });
  });

  // leave room
  socket.on('room:leave', ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('room:participant_left', {
      userId: socket.data.user._id
    });
  });

  // handle disconnect — notify all rooms this socket was in
  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('room:participant_left', {
          userId: socket.data.user._id
        });
      }
    }
  });
};
```

Register in `src/socket/index.ts`:
```typescript
io.on('connection', (socket) => {
  console.log(`${socket.data.user.name} connected`);
  registerRoomHandlers(io, socket);
});
```

### 5.3 — Socket Singleton (Frontend)

Create `src/socket/socket.ts` — the singleton with `autoConnect: false`
and `withCredentials: true` as documented in the architecture.

### 5.4 — Room Store (Frontend)

Create `src/store/roomStore.ts`:
```typescript
import { create } from 'zustand';

interface Participant { _id: string; name: string; avatar?: string; }

interface RoomStore {
  activeRoomId: string | null;
  participants: Participant[];
  setActiveRoom: (id: string) => void;
  clearActiveRoom: () => void;
  setParticipants: (p: Participant[]) => void;
  addParticipant: (p: Participant) => void;
  removeParticipant: (userId: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  activeRoomId: null,
  participants: [],
  setActiveRoom: (id) => set({ activeRoomId: id }),
  clearActiveRoom: () => set({ activeRoomId: null, participants: [] }),
  setParticipants: (participants) => set({ participants }),
  addParticipant: (p) => set(state => ({
    participants: [...state.participants, p]
  })),
  removeParticipant: (userId) => set(state => ({
    participants: state.participants.filter(p => p._id !== userId)
  })),
}));
```

### 5.5 — useRoomSocket Hook (Frontend)

Create `src/socket/useRoomSocket.ts`:
- On mount: `socket.emit('room:join', { roomId })`
- Listen `room:participants_list` → `setParticipants`
- Listen `room:participant_joined` → `addParticipant`
- Listen `room:participant_left` → `removeParticipant`
- On unmount: `socket.emit('room:leave', { roomId })` + remove all listeners

### 5.6 — Connect Socket After Login (Frontend)

In `useAuth` hook — after successful login/register, call `connectSocket()`.
In logout — call `disconnectSocket()` before clearing state.

On app mount (`AuthGuard` or root layout) — if user exists in `/me` response,
call `connectSocket()`.

### 5.7 — Wire Into Room Page (Frontend)

In `/rooms/[roomId]/page.tsx`:
- Call `useRoomSocket(roomId)` — joins room, listens for participant events
- Read participants from `useRoomStore` (not from React Query for live count)
- Build `ParticipantList` component reading from `roomStore.participants`

### ✅ Phase 5 Checklist
Open the same room in two browser tabs (or two browsers):
- [ ] Both tabs connect to Socket.io successfully (check server logs)
- [ ] When Tab 2 opens the room, Tab 1 sees the participant count increase
- [ ] When Tab 2 closes the room, Tab 1 sees the participant count decrease
- [ ] Closing the browser tab removes the participant (disconnecting event)
- [ ] Refreshing the page reconnects and rejoins the room correctly
- [ ] Auth rejected socket connection shows in server logs (test with no cookie)

---

## Phase 6 — Real-time Chat

> **STATUS: COMPLETE** — chatStore, useChatSocket, ChatWindow/ChatMessage/ChatInput components, GET /api/rooms/:id/messages endpoint all implemented.

**Goal:** Users in the same room can send and receive messages instantly.

### 6.1 — Message Model (Backend)

Create `src/models/Message.ts`:
```typescript
const messageSchema = new mongoose.Schema({
  room:   { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:   { type: String, required: true, trim: true, maxlength: 500 },
}, { timestamps: true });

messageSchema.index({ room: 1, createdAt: 1 });
```

### 6.2 — Chat Socket Handlers (Backend)

Create `src/socket/chatHandlers.ts`:
```typescript
export const registerChatHandlers = (io: Server, socket: Socket) => {
  socket.on('chat:message', async ({ roomId, text }) => {
    if (!text?.trim()) return;

    // save to DB
    const message = await Message.create({
      room: roomId,
      sender: socket.data.user._id,
      text: text.trim()
    });
    const populated = await message.populate('sender', 'name avatar');

    // broadcast to everyone in room (including sender)
    io.to(roomId).emit('chat:message', populated);
  });
};
```

Register in `src/socket/index.ts`.

### 6.3 — Chat History REST Endpoint (Backend)

Add to room routes:
`GET /api/rooms/:id/messages?page=1&limit=50` — returns paginated chat history,
sorted oldest first. This loads previous messages when a user first enters a room.

### 6.4 — Message Types (Frontend)

Create `src/types/message.ts`:
```typescript
export interface Message {
  _id: string;
  room: string;
  sender: { _id: string; name: string; avatar?: string };
  text: string;
  createdAt: string;
}
```

### 6.5 — Chat Store (Frontend)

Create `src/store/chatStore.ts`:
```typescript
import { create } from 'zustand';
import { Message } from '@/types/message';

interface ChatStore {
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set(state => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
}));
```

### 6.6 — useChatSocket Hook (Frontend)

Create `src/socket/useChatSocket.ts`:
- On mount: fetch chat history via React Query (`GET /api/rooms/:id/messages`)
  and call `setMessages` to seed the store
- Listen `chat:message` → `addMessage` to Zustand
- Return `sendMessage(text)` function that emits `chat:message`
- On unmount: `socket.off('chat:message', handler)`, `clearMessages()`

### 6.7 — Chat Components (Frontend)

Build `src/components/room/ChatWindow.tsx`:
- Reads `messages` from `useChatStore`
- Auto-scrolls to bottom when new message arrives (`useRef` + `useEffect`)
- Renders list of `ChatMessage` components

Build `src/components/room/ChatMessage.tsx`:
- Shows sender avatar (initials fallback), name, message text, timestamp
- Own messages aligned right, others aligned left

Build `src/components/room/ChatInput.tsx`:
- Controlled input, sends on Enter or button click
- Clears after send
- Disabled when not connected

Wire everything into `/rooms/[roomId]/page.tsx`.

### ✅ Phase 6 Checklist
Test with two browser tabs in the same room:
- [ ] Previous messages load when entering a room
- [ ] Sending a message in Tab 1 appears instantly in Tab 2
- [ ] Messages show sender name and time
- [ ] Your own messages are visually distinct (right-aligned or different color)
- [ ] Chat auto-scrolls to the newest message
- [ ] Empty input cannot be sent
- [ ] Messages are persisted — refresh and they still appear

---

## Phase 7 — Study Timer (Shared + Synced)

> **STATUS: COMPLETE** — useTimerSocket, StudyTimer, TimerControls, SessionSummary, timer state in roomStore all implemented.

**Goal:** Any participant can start a shared timer. All users in the room see the
same timer. Late joiners sync to the correct elapsed time.

### 7.1 — Session Model (Backend)

Create `src/models/Session.ts`:
```typescript
const sessionSchema = new mongoose.Schema({
  room:         { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startedAt:    { type: Date, required: true },
  endedAt:      { type: Date },
  duration:     { type: Number },                // seconds
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:       { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' }
}, { timestamps: true });

sessionSchema.index({ room: 1, createdAt: -1 });
sessionSchema.index({ startedBy: 1, status: 1 });
```

### 7.2 — Timer Socket Handlers (Backend)

Create `src/socket/timerHandlers.ts`:

```typescript
// In-memory timer state per room (lost on server restart — acceptable for this project)
const activeTimers = new Map<string, {
  sessionId: string;
  startedAt: number;
  isRunning: boolean;
  pausedAt?: number;
  elapsed: number;
}>();

export const registerTimerHandlers = (io: Server, socket: Socket) => {

  socket.on('timer:start', async ({ roomId }) => {
    if (activeTimers.has(roomId)) return; // already running

    const session = await Session.create({
      room: roomId,
      startedBy: socket.data.user._id,
      startedAt: new Date(),
      status: 'active'
    });

    activeTimers.set(roomId, {
      sessionId: session._id.toString(),
      startedAt: Date.now(),
      isRunning: true,
      elapsed: 0
    });

    io.to(roomId).emit('timer:started', {
      startedAt: Date.now(),
      startedBy: socket.data.user,
      sessionId: session._id
    });
  });

  socket.on('timer:pause', ({ roomId }) => {
    const timer = activeTimers.get(roomId);
    if (!timer || !timer.isRunning) return;

    const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
    activeTimers.set(roomId, { ...timer, isRunning: false, pausedAt: Date.now(), elapsed });

    io.to(roomId).emit('timer:paused', { elapsed });
  });

  socket.on('timer:resume', ({ roomId }) => {
    const timer = activeTimers.get(roomId);
    if (!timer || timer.isRunning) return;

    activeTimers.set(roomId, {
      ...timer,
      isRunning: true,
      startedAt: Date.now() - (timer.elapsed * 1000),
      pausedAt: undefined
    });

    io.to(roomId).emit('timer:resumed', { startedAt: Date.now() - (timer.elapsed * 1000) });
  });

  socket.on('timer:end', async ({ roomId }) => {
    const timer = activeTimers.get(roomId);
    if (!timer) return;

    const duration = Math.floor((Date.now() - timer.startedAt) / 1000) + timer.elapsed;

    // get current participants
    const socketsInRoom = await io.in(roomId).fetchSockets();
    const participantIds = socketsInRoom.map(s => s.data.user._id);

    await Session.findByIdAndUpdate(timer.sessionId, {
      endedAt: new Date(),
      duration,
      participants: participantIds,
      status: 'completed'
    });

    activeTimers.delete(roomId);
    io.to(roomId).emit('timer:ended', { sessionId: timer.sessionId, duration });
  });

  // new joiner requests current timer state
  socket.on('timer:sync_request', ({ roomId }) => {
    const timer = activeTimers.get(roomId);
    if (!timer) {
      socket.emit('timer:sync', { isRunning: false, elapsed: 0 });
      return;
    }

    const elapsed = timer.isRunning
      ? Math.floor((Date.now() - timer.startedAt) / 1000)
      : timer.elapsed;

    socket.emit('timer:sync', {
      isRunning: timer.isRunning,
      elapsed,
      startedAt: timer.startedAt
    });
  });
};
```

Register in `src/socket/index.ts`.

### 7.3 — Timer State in Room Store (Frontend)

Add timer state to `src/store/roomStore.ts`:
```typescript
timer: {
  isRunning: boolean;
  elapsed: number;          // seconds — each client increments locally
  startedAt: number | null; // unix ms
  sessionId: string | null;
}
startTimer: (payload: { startedAt: number; sessionId: string }) => void;
pauseTimer: (elapsed: number) => void;
resumeTimer: (startedAt: number) => void;
syncTimer: (payload: { isRunning: boolean; elapsed: number; startedAt?: number }) => void;
resetTimer: () => void;
```

### 7.4 — useTimerSocket Hook (Frontend)

Create `src/socket/useTimerSocket.ts`:
- On mount: emit `timer:sync_request` to get current state
- Listen `timer:started` → `startTimer` in roomStore
- Listen `timer:paused` → `pauseTimer`
- Listen `timer:resumed` → `resumeTimer`
- Listen `timer:sync` → `syncTimer`
- Listen `timer:ended` → `resetTimer` + open session summary modal
- Return `{ startTimer, pauseTimer, resumeTimer, endTimer }` functions

### 7.5 — StudyTimer Component (Frontend)

Create `src/components/room/StudyTimer.tsx`:
- Reads `timer` from `useRoomStore`
- Uses `useEffect` + `setInterval` to increment `elapsed` by 1 every second
  **only when `timer.isRunning` is true**
- Formats elapsed as `HH:MM:SS`
- Large, prominent display — this is the centerpiece of the room

```typescript
useEffect(() => {
  if (!timer.isRunning) return;
  const interval = setInterval(() => {
    // calculate elapsed from startedAt for accuracy
    // don't just increment — avoids drift
    const elapsed = Math.floor((Date.now() - timer.startedAt!) / 1000);
    setDisplayElapsed(elapsed);
  }, 1000);
  return () => clearInterval(interval);
}, [timer.isRunning, timer.startedAt]);
```

Build `src/components/room/TimerControls.tsx`:
- Start button (disabled if timer already running)
- Pause / Resume button (disabled if timer not running)
- End Session button (shows confirmation before ending)

Build `src/components/room/SessionSummary.tsx`:
- Modal that appears when `timer:ended` fires
- Shows duration in a readable format: "You studied for 1h 23m"
- Button to close and return to room

### 7.6 — Format Utility

Create `src/utils/formatDuration.ts`:
```typescript
export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const formatTimer = (seconds: number): string => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};
```

### ✅ Phase 7 Checklist
Test with two browser tabs in the same room:
- [ ] Start timer in Tab 1 — Tab 2 sees timer start simultaneously
- [ ] Both tabs show the same elapsed time
- [ ] Pause in Tab 1 — Tab 2 pauses at the same value
- [ ] Open Tab 3 mid-session — it syncs to correct elapsed time immediately
- [ ] End session — all tabs show SessionSummary with correct duration
- [ ] Session is saved to MongoDB with correct duration and participants
- [ ] Timer shows `00:00:00` when no session is active

---

## Phase 8 — Session History & User Profile

> **STATUS: COMPLETE** — useSessions hooks, SessionCard/SessionList components, history page all implemented.

**Goal:** Users can view their past study sessions and see total stats.

### 8.1 — Session Controller (Backend)

Create `src/controllers/sessionController.ts`:
- `getUserSessions` — `GET /api/sessions` — all sessions for current user,
  populated with room name, sorted newest first
- `getRoomSessions` — `GET /api/sessions/room/:roomId` — all sessions in a room
- `getUserStats` — `GET /api/sessions/stats` — aggregation query returning:
  - `totalSessions`
  - `totalMinutes`
  - `currentStreak` (consecutive days with at least one completed session)
  - `longestSession` (max duration in seconds)

### 8.2 — Session Routes (Backend)

Create `src/routes/sessionRoutes.ts`, all protected.
Register in `index.ts`:
```typescript
app.use('/api/sessions', sessionRoutes);
```

### 8.3 — useSessions Hook (Frontend)

Create `src/hooks/useSessions.ts`:
- `useGetUserSessions()` — `useQuery` on `['sessions']`
- `useGetRoomSessions(roomId)` — `useQuery` on `['sessions', 'room', roomId]`
- `useGetStats()` — `useQuery` on `['sessions', 'stats']`

React Query cache for sessions should be invalidated when `timer:ended`
socket event fires — do this in `useTimerSocket` after resetting the timer:
```typescript
queryClient.invalidateQueries({ queryKey: ['sessions'] });
```

### 8.4 — History Page (Frontend)

Build `src/app/(dashboard)/history/page.tsx`:
- Shows stats cards at the top: Total Sessions, Total Hours, Longest Session
- Below: list of past sessions

Build `src/components/history/SessionCard.tsx`:
- Shows room name, date, duration, number of participants
- Duration formatted as "1h 23m"

Build `src/components/history/SessionList.tsx`:
- List of SessionCards with loading skeleton
- Empty state: "No sessions yet. Start studying!"

### 8.5 — Room Activity History

In `/rooms/[roomId]/page.tsx`, add a tab or section showing
recent sessions for that specific room using `useGetRoomSessions(roomId)`.

### ✅ Phase 8 Checklist
- [ ] History page shows all past sessions
- [ ] Stats show correct totals (verify against MongoDB manually)
- [ ] After ending a session, history page updates automatically (React Query invalidation)
- [ ] Room page shows that room's session history
- [ ] Sessions show correct duration, date, and room name
- [ ] Empty state shows for new users with no sessions

---

## Phase 9 — Activity Dashboard

> **STATUS: COMPLETE** — Full dashboard with stats, recent sessions, settings page, invite flow all implemented.

**Goal:** The main dashboard gives a meaningful overview of user activity and rooms.

### 9.1 — Dashboard Page (Frontend)

Build out `src/app/(dashboard)/page.tsx` fully:

**Top section — Stats Bar:**
- Total study hours this week
- Number of active rooms
- Current streak (days)
Pull from `useGetStats()`.

**Middle section — Your Rooms:**
- Grid of rooms the user owns or is a participant in
- Each card shows: room name, online participant count (live from Socket.io),
  last session date
- "Create Room" button

**Bottom section — Recent Activity:**
- Last 5 sessions with room name, duration, date
Pull from `useGetUserSessions()` limited to 5.

### 9.2 — Live Participant Count on Room Cards

This is a nice touch: room cards on the dashboard show how many people are
currently online in that room.

Approach: when the user is on the dashboard, have the server maintain a
`room:online_count` broadcast. Alternatively, simpler approach: show participant
count from the REST response (persisted members), and add a green dot only when
the user themselves is inside a room.

### 9.3 — Invite User Flow

Build out invite functionality:
- In room page header, "Invite" button opens a modal
- User types an email address
- Calls `POST /api/rooms/:id/invite`
- Shows success/error message

### 9.4 — Settings Page

Build `src/app/(dashboard)/settings/page.tsx`:
- Update name form → `PUT /api/users/profile`
- Shows current email (read only)
- On save, update Zustand `authStore` with new name

### 9.5 — Avatar Component

Build `src/components/ui/Avatar.tsx`:
- If user has avatar URL, show image
- Otherwise show colored circle with initials (e.g. "JD" for John Doe)
- Used in ParticipantList, ChatMessage, Header, SessionCard

### ✅ Phase 9 Checklist
- [ ] Dashboard shows real stats pulled from the API
- [ ] Recent sessions appear in the bottom section
- [ ] Room cards show on the dashboard
- [ ] Invite user flow works end to end
- [ ] Settings page updates user name
- [ ] Avatar initials show correctly everywhere

---

## Phase 10 — Deployment

> **STATUS: NOT STARTED**

**Goal:** Both backend and frontend are live, accessible, and fully functional in production.

### 10.1 — Prepare Backend for Production

Update cookie settings in `generateToken.ts`:
```typescript
// already handled by NODE_ENV check in Phase 2
sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
secure:   process.env.NODE_ENV === 'production'
```

Add a `start` script in `package.json`:
```json
"build": "tsc",
"start": "node dist/index.js"
```

Make sure `.gitignore` includes:
```
node_modules/
dist/
.env
```

### 10.2 — Deploy Backend to Render

1. Push backend to a public GitHub repo
2. Create a new **Web Service** on Render
3. Set build command: `npm install && npm run build`
4. Set start command: `npm run start`
5. Add all environment variables from `.env` in Render's dashboard
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `CLIENT_URL` → your Vercel URL (set this after frontend deploys)
   - `NODE_ENV=production`
6. **Enable WebSocket support** in Render service settings
7. Note your Render URL: `https://your-app.onrender.com`

### 10.3 — Deploy Frontend to Vercel

1. Push frontend to a public GitHub repo
2. Import project on Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-app.onrender.com/api`
   - `NEXT_PUBLIC_SOCKET_URL=https://your-app.onrender.com`
4. Deploy
5. Note your Vercel URL: `https://your-app.vercel.app`

### 10.4 — Update CORS on Backend

Go back to Render → update `CLIENT_URL` environment variable to your actual
Vercel URL. Trigger a redeploy.

### 10.5 — Smoke Test Production

- [ ] Register a new account on the live URL
- [ ] Login persists after page refresh
- [ ] Create a room
- [ ] Open the room in two different browsers/devices
- [ ] Chat works in real-time between the two
- [ ] Timer starts, syncs, and saves session on end
- [ ] History page shows the saved session

### 10.6 — README.md

Write `README.md` in both repos (required for submission):

**Frontend README must include:**
```markdown
## Setup Instructions
1. Clone the repo
2. npm install
3. Create .env.local with NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SOCKET_URL
4. npm run dev

## Features Implemented
- Authentication (register/login/logout) with httpOnly cookies
- Create and browse study rooms
- Real-time participant presence
- Real-time chat with message history
- Shared study timer with sync for late joiners
- Session history and activity stats
- Room invitations

## Tech Stack
Next.js 14, TypeScript, Tailwind CSS, TanStack Query, Zustand, Socket.io
```

### ✅ Phase 10 Checklist
- [ ] Backend live on Render, health endpoint returns 200
- [ ] Frontend live on Vercel
- [ ] WebSocket connects in production (check browser DevTools → Network → WS)
- [ ] Cookie is set correctly in production (check DevTools → Application → Cookies)
- [ ] CORS not throwing errors in browser console
- [ ] Full user journey works end to end on production URL
- [ ] README.md in both repos
- [ ] No `.env` files committed to GitHub
- [ ] No hardcoded URLs or secrets in code

---

## Implementation Order Summary

```
Phase 1  →  Scaffolding              (both projects boot, MongoDB connects)           ✅ DONE (backend), frontend shell exists
Phase 2  →  Backend Auth             (register, login, logout, /me)                   ✅ DONE (backend code complete, not REST-tested yet)
Phase 3  →  Frontend Auth            (login page, Zustand, protected routes)          ✅ DONE
Phase 4  →  Room CRUD                (create, browse, view rooms — REST only)         ✅ DONE
Phase 5  →  Socket.io Foundation     (connect, join/leave rooms, participant presence) ✅ DONE
Phase 6  →  Real-time Chat           (send, receive, persist messages)                ✅ DONE
Phase 7  →  Study Timer              (start, pause, sync, end — shared across clients) ✅ DONE
Phase 8  →  Session History          (history page, stats, React Query invalidation)  ✅ DONE
Phase 9  →  Activity Dashboard       (stats bar, recent activity, invite, settings)   ✅ DONE
Phase 10 →  Deployment               (Render + Vercel, production smoke test)         ❌ NOT STARTED
```

**Time estimate given your deadline:**
```
Phase 1-2   →  ~2 hours   (setup + backend auth)
Phase 3-4   →  ~3 hours   (frontend auth + rooms)
Phase 5-6   →  ~3 hours   (socket foundation + chat)
Phase 7     →  ~2 hours   (timer — most complex)
Phase 8-9   →  ~2 hours   (history + dashboard)
Phase 10    →  ~1 hour    (deployment)
Total       →  ~13 hours
```

Do not jump ahead. Each phase has a checklist — do not move on until every
item passes. The most common mistake is skipping Phase 5 verification and
discovering the WebSocket auth is broken only in Phase 7.