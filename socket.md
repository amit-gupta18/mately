# Understanding Socket.io — From Zero to Confident

## Table of Contents

1. [The Problem Socket.io Solves](#the-problem-socketio-solves)
2. [HTTP vs WebSocket — The Core Difference](#http-vs-websocket--the-core-difference)
3. [What is Socket.io](#what-is-socketio)
4. [How Socket.io Actually Works](#how-socketio-actually-works)
5. [Core Concepts](#core-concepts)
6. [Events — The Heartbeat of Socket.io](#events--the-heartbeat-of-socketio)
7. [Rooms — The Most Important Feature for This Project](#rooms--the-most-important-feature-for-this-project)
8. [Socket.io vs Raw WebSocket](#socketio-vs-raw-websocket)
9. [Setting Up Socket.io — Server Side](#setting-up-socketio--server-side)
10. [Setting Up Socket.io — Client Side](#setting-up-socketio--client-side)
11. [Authentication with Cookies](#authentication-with-cookies)
12. [Common Patterns You Will Use](#common-patterns-you-will-use)
13. [How It Fits Into This Project](#how-it-fits-into-this-project)
14. [Things That Trip Everyone Up](#things-that-trip-everyone-up)

---

## The Problem Socket.io Solves

To understand Socket.io, you first need to understand why normal HTTP is not enough for real-time apps.

Imagine you are building the chat feature for your study room. A user sends a message. You want every other person in the room to see it **instantly**.

With normal HTTP (fetch/REST), the only way to do this is:

```
Option 1 — Polling:
  Every client asks the server every 2 seconds: "Any new messages?"
  Server responds: "No." "No." "No." "Yes, here is one."

  Problem: Wasteful. 99% of requests get "No." back.
  Terrible for real-time feel. High server load.

Option 2 — Long Polling:
  Client asks server: "Any new messages?"
  Server holds the connection open and waits until there is one.
  Then responds. Client immediately asks again.

  Better, but still hacky. Each "real-time" message requires
  a full HTTP request-response cycle.
```

Neither feels truly real-time. Both waste resources.

**What you actually want:**

```
User A sends message
    ↓
Server receives it
    ↓
Server PUSHES it to User B, C, D instantly
    ↓
No polling. No asking. Just push.
```

That is exactly what WebSocket (and Socket.io on top of it) gives you.

---

## HTTP vs WebSocket — The Core Difference

### HTTP — Request / Response (One direction at a time)

```
Client                          Server
  │                               │
  │ ── GET /messages ──────────►  │
  │                               │  (processes request)
  │ ◄── 200 OK [messages] ──────  │
  │                               │
  │  (connection closes)          │
  │                               │
  │  ...2 seconds later...        │
  │                               │
  │ ── GET /messages ──────────►  │   ← you have to ask again
  │ ◄── 200 OK [messages] ──────  │
```

HTTP is **stateless** — each request is independent. The server cannot reach out to the client. It can only respond when asked.

### WebSocket — Persistent Bidirectional Connection

```
Client                          Server
  │                               │
  │ ── Upgrade: websocket ──────► │   ← one-time handshake
  │ ◄── 101 Switching Protocols ─ │
  │                               │
  │  (connection stays open)      │
  │                               │
  │ ── "hey I joined room A" ───► │
  │ ◄── "User B joined room A" ── │   ← server pushes, no request needed
  │ ◄── "New chat message" ─────  │   ← server pushes again
  │ ── "timer:start" ───────────► │
  │ ◄── "timer:started" ────────  │
  │                               │
  │  (connection stays open       │
  │   for entire session)         │
```

WebSocket creates a **persistent, bidirectional pipe** between client and server. Either side can send data at any time without waiting to be asked.

This is the foundation. Socket.io builds on top of this.

---

## What is Socket.io

Socket.io is **not** WebSocket. It is a library that:

- Uses WebSocket as its primary transport
- Falls back to HTTP long-polling if WebSocket is not available (old networks, proxies)
- Adds a structured **event system** on top of the raw WebSocket connection
- Adds **rooms** — a way to group sockets and broadcast to all of them at once
- Adds **automatic reconnection** if the connection drops
- Handles the **handshake, ping/pong heartbeat, and connection management** for you

Think of it this way:

```
Raw WebSocket  =  a phone line with no buttons, no caller ID, just a wire
Socket.io      =  a full phone system: rooms, hold, transfer, caller ID, voicemail
```

Socket.io has two parts:

```
socket.io        →  the SERVER package (npm install socket.io)
socket.io-client →  the CLIENT package (npm install socket.io-client)
```

They talk to each other using the same protocol. You must use both together.

---

## How Socket.io Actually Works

### Step 1 — The Handshake

When a Socket.io client connects, it first makes a normal HTTP request to negotiate the connection. This is where your auth middleware runs and can reject the connection before it even becomes a WebSocket.

```
Client → HTTP GET /?EIO=4&transport=polling   (initial handshake)
Server → 200 OK + session ID

Client → HTTP POST (optional upgrade negotiation)
Client → HTTP GET  Upgrade: websocket

Server → 101 Switching Protocols
         (connection upgrades from HTTP to WebSocket)
```

After this, the connection is a persistent WebSocket. All communication from here is through events.

### Step 2 — Events

Everything in Socket.io is an **event**. You name an event, attach data to it, and send it. The other side listens for that event name and reacts.

```
Client emits:   socket.emit('chat:message', { text: 'hello' })
                      ↓ travels over WebSocket ↓
Server receives: socket.on('chat:message', (data) => { ... })
```

And in reverse:

```
Server emits:   io.to(roomId).emit('chat:message', { sender, text })
                      ↓ pushed to all clients in room ↓
Client receives: socket.on('chat:message', (data) => { ... })
```

### Step 3 — Each Connected User is a Socket

Every user who connects gets their own **socket object** on the server. Think of it as a unique pipe between that specific user and the server.

```
User A connects → socket_A (id: "abc123")
User B connects → socket_B (id: "def456")
User C connects → socket_C (id: "ghi789")

Server has all three socket objects and can talk to any of them individually,
or to groups of them using rooms.
```

---

## Core Concepts

### `io` — The Server

`io` is the Socket.io server instance. It represents the entire server.

```typescript
import { Server } from 'socket.io';
const io = new Server(httpServer);

io.emit('announcement', 'Server is restarting');
// sends to EVERY connected client in the world
```

### `socket` — One Connected User

`socket` represents a single connected client. Inside the `connection` event, every `socket` is a different user.

```typescript
io.on('connection', (socket) => {
  // socket = one specific user who just connected
  console.log('User connected:', socket.id);

  socket.emit('welcome', 'Hello you specifically');
  // sends only to this one user

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

### `socket.id`

Every socket gets a unique auto-generated ID. This is how the server tells users apart.

```typescript
socket.id  // something like "xG1k2Hn3..."
```

### `socket.data`

A place to attach custom data to a socket. Perfect for storing the authenticated user after your auth middleware runs.

```typescript
// in auth middleware
socket.data.user = { _id: '...', name: 'John' };

// later in any handler
io.on('connection', (socket) => {
  console.log(socket.data.user.name); // "John"
});
```

---

## Events — The Heartbeat of Socket.io

Everything is events. There are two types:

### Built-in Events (automatic)

| Event | Where | When |
|-------|-------|------|
| `connection` | Server | A new client connects |
| `disconnect` | Server & Client | Connection drops or closes |
| `connect` | Client | Successfully connected to server |
| `connect_error` | Client | Failed to connect |

```typescript
// Server
io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('disconnected:', reason);
    // reason: 'transport close', 'ping timeout', 'server namespace disconnect'
  });
});

// Client
socket.on('connect', () => {
  console.log('connected to server');
});

socket.on('connect_error', (err) => {
  console.log('connection failed:', err.message);
});
```

### Custom Events (you define these)

These are the events your app uses. You name them whatever you want.

```typescript
// Naming convention: 'noun:verb' (resource:action)
'chat:message'
'timer:start'
'timer:pause'
'room:join'
'room:leave'
'participant:update'
```

**Emitting an event (sending):**

```typescript
socket.emit('eventName', payload);
// payload can be any object, string, number, array
```

**Listening for an event (receiving):**

```typescript
socket.on('eventName', (payload) => {
  // handle it
});
```

### Emit Cheatsheet — Who Gets the Message

This is the most important thing to understand. There are several ways to send:

```typescript
// 1. Send to ONE specific client (the sender)
socket.emit('event', data);

// 2. Send to ALL clients (everyone in the world)
io.emit('event', data);

// 3. Send to everyone in a room (most used in this project)
io.to('roomId').emit('event', data);

// 4. Send to everyone in a room EXCEPT the sender
socket.to('roomId').emit('event', data);

// 5. Send to a specific socket by ID
io.to(socketId).emit('event', data);

// 6. Send to multiple rooms at once
io.to('room1').to('room2').emit('event', data);
```

For your project, you will use #1, #3, and #4 the most.

---

## Rooms — The Most Important Feature for This Project

Rooms are the core concept that makes your study room platform work.

A Socket.io **room** is just a label. You add a socket to a room and then you can broadcast to everyone in that room with one line.

**Rooms exist only on the server.** Clients do not "know" about rooms — they just receive events.

### Joining a Room

```typescript
// Server side — inside a socket event handler
socket.join('room_abc123');
// this socket is now in room 'room_abc123'
```

### Leaving a Room

```typescript
socket.leave('room_abc123');
// socket is no longer in this room
```

### Broadcasting to a Room

```typescript
// Send to EVERYONE in the room (including sender)
io.to('room_abc123').emit('chat:message', { text: 'hello' });

// Send to everyone in room EXCEPT the sender
socket.to('room_abc123').emit('chat:message', { text: 'hello' });
```

### Seeing Who Is in a Room

```typescript
const sockets = await io.in('room_abc123').fetchSockets();
console.log(sockets.length); // number of connected users in this room
```

### Real Example — Your Study Room Join Flow

```typescript
// Server
socket.on('room:join', async ({ roomId }) => {
  // 1. add this socket to the Socket.io room
  socket.join(roomId);

  // 2. tell THIS user who else is already here
  const socketsInRoom = await io.in(roomId).fetchSockets();
  const participants = socketsInRoom.map(s => s.data.user);
  socket.emit('room:participants_list', { participants });

  // 3. tell EVERYONE ELSE in the room that this user joined
  socket.to(roomId).emit('room:participant_joined', {
    user: socket.data.user
  });
});

socket.on('disconnect', () => {
  // Socket.io automatically removes them from all rooms on disconnect
  // But you still need to tell other room members
  // Use socket.rooms to know which rooms they were in
});
```

---

## Socket.io vs Raw WebSocket

Here is a concrete comparison so you understand what Socket.io is saving you from:

### Sending a chat message to a specific room

**Raw WebSocket (ws package):**
```typescript
// You have to maintain this yourself
const rooms = new Map<string, Set<WebSocket>>();

// You have to manually track which client is in which room
// You have to define your own message format
// You have to parse JSON yourself
// You have to handle disconnects and clean up the Map
// You have to implement your own reconnection on the client

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const { event, roomId, data } = JSON.parse(raw.toString());
    if (event === 'chat:message') {
      const room = rooms.get(roomId);
      if (room) {
        room.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ event: 'chat:message', data }));
          }
        });
      }
    }
  });
  ws.on('close', () => {
    // find which rooms this ws was in and remove it from all of them
    rooms.forEach((sockets, roomId) => {
      sockets.delete(ws);
    });
  });
});
```

**Socket.io:**
```typescript
socket.on('chat:message', ({ roomId, text }) => {
  socket.to(roomId).emit('chat:message', { sender: socket.data.user, text });
});
```

That is the entire thing. One line. Socket.io handles the rest.

---

## Setting Up Socket.io — Server Side

### Installation

```bash
npm install socket.io cookie-parser
```

### Basic Setup (Express + Socket.io on same port)

```typescript
// src/index.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const httpServer = createServer(app);  // wrap express in http server

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,               // allow cookies
  }
});

app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Socket.io auth middleware — runs before any event handler
io.use((socket, next) => {
  const token = socket.request.cookies?.token;

  if (!token) {
    return next(new Error('Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.user = decoded;   // attach user to socket
    next();                       // allow connection
  } catch (err) {
    next(new Error('Token invalid or expired'));
  }
});

// Connection handler — runs for every new connected user
io.on('connection', (socket) => {
  console.log(`${socket.data.user.name} connected (${socket.id})`);

  // Register all event handlers here
  socket.on('room:join', ({ roomId }) => {
    socket.join(roomId);
    socket.to(roomId).emit('room:participant_joined', {
      user: socket.data.user
    });
  });

  socket.on('chat:message', ({ roomId, text }) => {
    const message = {
      sender: socket.data.user,
      text,
      createdAt: new Date()
    };
    // broadcast to everyone in room including sender
    io.to(roomId).emit('chat:message', message);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.data.user.name} disconnected`);
  });
});

// Start server — one port handles both HTTP and WebSocket
httpServer.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

### Splitting Into Handler Files (Clean Architecture)

For your project, keep handlers in separate files:

```typescript
// socket/roomHandlers.ts
export const registerRoomHandlers = (io: Server, socket: Socket) => {
  socket.on('room:join', ({ roomId }) => {
    socket.join(roomId);
    socket.to(roomId).emit('room:participant_joined', {
      user: socket.data.user
    });
  });

  socket.on('room:leave', ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('room:participant_left', {
      userId: socket.data.user._id
    });
  });
};

// socket/chatHandlers.ts
export const registerChatHandlers = (io: Server, socket: Socket) => {
  socket.on('chat:message', async ({ roomId, text }) => {
    // save to DB
    const message = await Message.create({
      room: roomId,
      sender: socket.data.user._id,
      text
    });
    const populated = await message.populate('sender', 'name avatar');

    // broadcast to room
    io.to(roomId).emit('chat:message', populated);
  });
};

// socket/index.ts
io.on('connection', (socket) => {
  registerRoomHandlers(io, socket);
  registerChatHandlers(io, socket);
  registerTimerHandlers(io, socket);
});
```

---

## Setting Up Socket.io — Client Side

### Installation

```bash
npm install socket.io-client
```

### Singleton Pattern (Critical)

You must create **one socket instance** and reuse it everywhere. If you create a new socket on every component render, you get multiple connections and chaos.

```typescript
// src/socket/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,   // send httpOnly cookie for auth
      autoConnect: false,      // do NOT connect until we call connect()
    });
  }
  return socket;
};

export const connectSocket = () => {
  getSocket().connect();
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### Connecting After Login

```typescript
// in your useAuth hook, after successful login:
const loginMutation = useMutation({
  mutationFn: (data) => fetcher('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  onSuccess: (data) => {
    useAuthStore.getState().setUser(data.user);
    connectSocket();               // connect socket AFTER login
    router.push('/dashboard');
  }
});
```

### Using Socket in a Component — useSocket Hook

```typescript
// src/socket/useSocket.ts
import { useEffect } from 'react';
import { getSocket } from './socket';

export const useSocket = () => {
  const socket = getSocket();
  return socket;
};
```

### Listening to Events in a Component

This is the most important pattern. You must clean up listeners when the component unmounts, otherwise you get duplicate handlers and memory leaks.

```typescript
// src/socket/useChatSocket.ts
import { useEffect } from 'react';
import { getSocket } from './socket';
import { useChatStore } from '@/store/chatStore';

export const useChatSocket = (roomId: string) => {
  const addMessage = useChatStore(state => state.addMessage);

  useEffect(() => {
    const socket = getSocket();

    // Listen for incoming messages
    const handleMessage = (message: Message) => {
      addMessage(message);            // update Zustand store → UI re-renders
    };

    socket.on('chat:message', handleMessage);

    // CRITICAL: clean up when component unmounts
    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [roomId, addMessage]);

  // Function to send a message
  const sendMessage = (text: string) => {
    getSocket().emit('chat:message', { roomId, text });
  };

  return { sendMessage };
};
```

### Emitting Events from a Component

```typescript
// Inside ChatInput.tsx
const { sendMessage } = useChatSocket(roomId);

const handleSubmit = (text: string) => {
  sendMessage(text);   // emits to server, server broadcasts back to room
};
```

---

## Authentication with Cookies

Since your project uses httpOnly cookies, the authentication for Socket.io is automatic:

**Client side:**
```typescript
const socket = io(SOCKET_URL, {
  withCredentials: true,   // this one line sends the httpOnly cookie
});
```

**Server side:**
```typescript
// install: npm install cookie-parser @types/cookie-parser
// AND for socket.io to parse cookies: npm install cookie

import cookieParser from 'cookie-parser';
import cookie from 'cookie';

io.use((socket, next) => {
  // Parse cookies from the handshake headers
  const cookieHeader = socket.request.headers.cookie;
  if (!cookieHeader) return next(new Error('Unauthorized'));

  const cookies = cookie.parse(cookieHeader);
  const token = cookies.token;

  if (!token) return next(new Error('Unauthorized'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.user = decoded;
    next();
  } catch {
    next(new Error('Token invalid'));
  }
});
```

---

## Common Patterns You Will Use

### Pattern 1 — Join Room + Notify Others + Sync State

```typescript
// Server
socket.on('room:join', async ({ roomId }) => {
  await socket.join(roomId);

  // tell the joiner about current participants
  const socketsInRoom = await io.in(roomId).fetchSockets();
  const participants = socketsInRoom
    .filter(s => s.id !== socket.id)
    .map(s => s.data.user);
  socket.emit('room:participants_list', { participants });

  // tell everyone else
  socket.to(roomId).emit('room:participant_joined', {
    user: socket.data.user
  });
});
```

### Pattern 2 — Broadcast Then Save to DB

```typescript
// Server — chat message
socket.on('chat:message', async ({ roomId, text }) => {
  // broadcast immediately for real-time feel
  const tempMessage = { sender: socket.data.user, text, createdAt: new Date() };
  io.to(roomId).emit('chat:message', tempMessage);

  // save to DB asynchronously
  await Message.create({ room: roomId, sender: socket.data.user._id, text });
});
```

### Pattern 3 — Timer Sync for Late Joiners

```typescript
// Server
const activeTimers = new Map<string, { startedAt: number; isRunning: boolean }>();

socket.on('timer:start', ({ roomId }) => {
  const timerState = { startedAt: Date.now(), isRunning: true };
  activeTimers.set(roomId, timerState);
  io.to(roomId).emit('timer:started', timerState);
});

socket.on('timer:sync_request', ({ roomId }) => {
  const timerState = activeTimers.get(roomId);
  if (timerState) {
    const elapsed = timerState.isRunning
      ? Math.floor((Date.now() - timerState.startedAt) / 1000)
      : 0;
    socket.emit('timer:sync', { ...timerState, elapsed });
  }
});
```

### Pattern 4 — Handle Disconnect Gracefully

```typescript
socket.on('disconnect', () => {
  // socket.rooms is already empty at this point for 'disconnect'
  // use 'disconnecting' event instead — fires before rooms are left
});

socket.on('disconnecting', () => {
  // socket.rooms still has the rooms at this point
  for (const roomId of socket.rooms) {
    if (roomId !== socket.id) {  // socket.id is always in socket.rooms
      socket.to(roomId).emit('room:participant_left', {
        userId: socket.data.user._id,
        userName: socket.data.user.name
      });
    }
  }
});
```

---

## How It Fits Into This Project

Here is the complete picture of how Socket.io integrates with your full stack:

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                           │
│                                                     │
│  socket.ts (singleton)                              │
│      ↕ withCredentials: true                        │
│                                                     │
│  useRoomSocket.ts    → reads/writes roomStore       │
│  useChatSocket.ts    → reads/writes chatStore       │
│  useTimerSocket.ts   → reads/writes roomStore.timer │
│                                                     │
│  Components read from Zustand stores                │
│  Components emit events via socket hooks            │
└──────────────────────┬──────────────────────────────┘
                       │  WebSocket (persistent)
                       │  httpOnly cookie auto-attached
                       ▼
┌─────────────────────────────────────────────────────┐
│                   BACKEND                            │
│                                                     │
│  io.use() → auth middleware → socket.data.user      │
│                                                     │
│  io.on('connection') → register all handlers        │
│      roomHandlers  → socket.join/leave              │
│      chatHandlers  → save to DB + broadcast         │
│      timerHandlers → sync state + broadcast         │
│                                                     │
│  io.to(roomId).emit() → pushes to all in room       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼  only for persistence
              ┌─────────────────┐
              │    MongoDB      │
              │  (messages,     │
              │   sessions)     │
              └─────────────────┘
```

**The key mental model:**

- **React Query** = anything that needs to be fetched, cached, or persisted via REST
- **Socket.io** = anything that needs to happen in real-time across multiple users
- **Zustand** = the bridge between Socket.io events and your React components

When a socket event arrives, it updates Zustand. Zustand updates trigger React re-renders. Your components always read from Zustand, never directly from the socket.

---

## Things That Trip Everyone Up

### 1. Creating multiple socket instances

```typescript
// WRONG — creates a new socket on every render
const MyComponent = () => {
  const socket = io('http://localhost:5000');  // ← never do this
};

// CORRECT — use the singleton
const MyComponent = () => {
  const socket = getSocket();   // reuses the one instance
};
```

### 2. Forgetting to clean up event listeners

```typescript
// WRONG — listener piles up every time component mounts
useEffect(() => {
  socket.on('chat:message', handleMessage);
  // no cleanup — if component remounts, you now have 2 listeners
}, []);

// CORRECT
useEffect(() => {
  socket.on('chat:message', handleMessage);
  return () => {
    socket.off('chat:message', handleMessage);  // ← always clean up
  };
}, []);
```

### 3. Using `io.emit` when you mean `socket.to(room).emit`

```typescript
// WRONG — sends to every connected user on the entire server
io.emit('chat:message', message);

// CORRECT — sends only to users in this specific room
io.to(roomId).emit('chat:message', message);
```

### 4. Forgetting `disconnecting` vs `disconnect`

```typescript
// WRONG for notifying room members — socket.rooms is already empty here
socket.on('disconnect', () => {
  for (const room of socket.rooms) { ... }  // socket.rooms is empty!
});

// CORRECT — 'disconnecting' fires while socket.rooms still has data
socket.on('disconnecting', () => {
  for (const room of socket.rooms) { ... }  // works correctly
});
```

### 5. Not sending `withCredentials: true` on the client

```typescript
// WRONG — cookie never reaches the server, auth fails
const socket = io('http://localhost:5000');

// CORRECT
const socket = io('http://localhost:5000', {
  withCredentials: true,   // ← this sends the httpOnly cookie
});
```

### 6. Forgetting CORS credentials on the server

```typescript
// WRONG — browser blocks the connection
const io = new Server(httpServer, {
  cors: { origin: 'https://your-app.vercel.app' }
});

// CORRECT
const io = new Server(httpServer, {
  cors: {
    origin: 'https://your-app.vercel.app',
    credentials: true,   // ← required when using cookies
  }
});
```

### 7. autoConnect: true (default) connecting before login

```typescript
// WRONG — socket tries to connect immediately on app load
// auth middleware rejects it because there is no cookie yet
const socket = io(SOCKET_URL);   // autoConnect defaults to true

// CORRECT — connect manually after login
const socket = io(SOCKET_URL, { autoConnect: false });
// then after login:
socket.connect();
```

---

*You now have everything you need to implement Socket.io in your project confidently. The architecture document maps directly to the patterns described here — every event in the event design table corresponds to one `socket.on` on the server and one `socket.emit` on the client.*