# Forge ⚔️🔥

> A goal-based habit and task tracker structured around long-term personal missions, six-part cosmic milestone progression, and real-time resistance against the passing of time.

---

## 🌌 Vision & Core Concept

**Forge** transforms long-term ambition into an active progression system:
1. **Long-Term Mission:** The user defines an overarching goal and time duration (e.g., *Placement Preparation — 3 Months*).
2. **6 Cosmic Milestones:** Each mission is divided into 6 user-configurable milestones representing powerful artifacts/stones.
3. **Tasks as Fuel:** Completing daily tasks within a milestone advances the user's progress bar.
4. **The Time Enemy:** Time itself progresses steadily as a rival force derived deterministically from the mission's timeframe.
5. **Milestone Loss & Reclaim:** If the Time Enemy captures a milestone before it is finished, it enters a `LOST` state. The mission continues, and the user can initiate a recovery challenge to reclaim the milestone.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (to be implemented)
- **Version Control:** Git & GitHub

---

## 📁 Project Structure

```text
forge/
├── client/                     # Frontend Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Shared, reusable UI primitives
│   │   ├── context/            # React state contexts
│   │   ├── features/           # Domain-driven modules (auth, missions, milestones, tasks, reclaim)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Page layouts & shells
│   │   ├── pages/              # Top-level view routes
│   │   ├── services/           # HTTP API client integrations
│   │   ├── types/              # TypeScript interfaces and contracts
│   │   ├── utils/              # Client-side utility functions
│   │   ├── App.tsx             # Main React entry component
│   │   ├── index.css           # Global stylesheet & Tailwind directives
│   │   └── main.tsx            # DOM root renderer
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend API Application
│   ├── prisma/
│   │   └── schema.prisma       # Database schema & migrations
│   ├── src/
│   │   ├── config/             # Server configurations & env loaders
│   │   ├── controllers/        # HTTP route controllers (request/response)
│   │   ├── middlewares/        # Express middlewares (auth, error handling)
│   │   ├── routes/             # Express route declarations
│   │   ├── services/           # Business logic & time progression math
│   │   ├── types/              # Backend TypeScript types
│   │   ├── utils/              # Helper utilities
│   │   ├── validations/        # Schema validators (e.g., Zod)
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # HTTP server listener
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── package.json                # Root orchestrator scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (installed locally or hosted via Docker / Supabase / Neon)

### 1. Installation

From the project root (`forge/`):

```bash
# Install both client and server dependencies
npm run install:all
```

Or individually:
```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment Variables

Create the `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Ensure `DATABASE_URL` matches your local PostgreSQL connection credentials:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/forge_db?schema=public"
PORT=5000
```

### 3. Running Locally

You can run both apps concurrently or in separate terminal windows:

#### Option A: Running from the root directory
```bash
# In Terminal 1 (Backend Server on http://localhost:5000)
npm run dev:server

# In Terminal 2 (Frontend Client on http://localhost:5173)
npm run dev:client
```

#### Option B: Running individually from subdirectories
```bash
# Backend Server
cd server
npm run dev

# Frontend Client
cd client
npm run dev
```

---

## 📡 API Health Check

Once the server is running, you can verify it by opening:
[http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-08-23T12:00:00.000Z",
  "service": "forge-api"
}
```
