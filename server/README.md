# GigFlow - Freelance Marketplace Backend API

A production-ready RESTful API for a mini-freelance marketplace platform built with Node.js, Express, TypeScript, and MongoDB. GigFlow enables Clients to post jobs (Gigs) and Freelancers to apply for them (Bids) with real-time notifications.

## 🚀 Features

- **Secure Authentication**: JWT-based auth with HTTP-only cookies and refresh token rotation
- **Gig Management**: Full CRUD operations for job postings with budget and deadline tracking
- **Bidding System**: Comprehensive system for freelancers to submit proposals and clients to manage applications
- **Real-Time Updates**: Socket.io integration for instant bid notifications and status changes
- **Session Management**: Persistent sessions with refresh token storage
- **Type Safety**: Full TypeScript implementation with strict typing
- **Clean Architecture**: Repository-Service-Controller pattern for maintainability
- **Validation**: Request validation using class-validator and DTOs
- **Database**: MongoDB with Prisma ORM
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Socket.io Integration](#-socketio-integration)
- [Testing](#-testing)

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js (v16+) | JavaScript runtime |
| **Framework** | Express.js | Web framework |
| **Language** | TypeScript | Type safety |
| **Database** | MongoDB | NoSQL database |
| **ORM** | Prisma | Database toolkit |
| **Authentication** | JWT + bcrypt | Secure auth |
| **Real-Time** | Socket.io | WebSocket communication |
| **Validation** | class-validator | DTO validation |
| **Documentation** | Swagger/OpenAPI | API docs |
| **Package Manager** | pnpm | Fast, disk-efficient |

---

## ✅ Prerequisites

- Node.js >= 16.0.0
- pnpm (recommended) or npm
- MongoDB instance (local or cloud)

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gigflow/server
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Generate Prisma client**
   ```bash
   pnpm run prisma:generate
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=8000
APP_BASE_URL=http://localhost

# Database
DATABASE_URL=mongodb://localhost:27017/gigflow

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# JWT Secrets
JWT_ACCESS_SECRET=your-secure-access-secret-key
JWT_REFRESH_SECRET=your-secure-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

---

## 🏃 Running the Application

### Development Mode
```bash
pnpm run dev
```

### Production Build
```bash
pnpm run build
pnpm start
```

### Other Commands
```bash
# Type checking
pnpm run check:types

# Linting
pnpm run lint
pnpm run lint:fix

# Code formatting
pnpm run format

# Prisma Studio (Database GUI)
pnpm run prisma:studio

# Run tests
pnpm run test
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1/development
```

### Swagger UI
```
http://localhost:8000/v1/swagger
```

### API Endpoints

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | Cookie |
| GET | `/auth/me` | Get current user | Yes |

#### Gig Endpoints (Jobs)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/gigs` | Create a new gig (Client) | Yes |
| GET | `/gigs` | List all gigs (with filters) | Yes |
| GET | `/gigs/:id` | Get gig details | Yes |
| PUT | `/gigs/:id` | Update gig details | Yes |
| DELETE | `/gigs/:id` | Remove gig | Yes |

#### Bidding Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/gigs/:id/bids` | Apply for a gig (Freelancer) | Yes |
| GET | `/gigs/:id/bids` | View bids for a gig | Yes |
| PATCH | `/bids/:id` | Accept/Reject a bid | Yes |

---

## 💡 Design Decisions

### Database Selection: MongoDB
**GigFlow** uses MongoDB for its flexible document model. Freelance marketplaces often require diverse metadata for different job categories (e.g., technical requirements for dev jobs vs. style guides for design). MongoDB allows us to store these varying attributes without rigid schema constraints.

### Role-Based Access Control
The system distinguishes between **Clients** (who post Gigs) and **Freelancers** (who place Bids). Business logic in the Service layer ensures that only the Gig creator can accept bids, and only freelancers can apply to open gigs.

### Real-Time Bidding
Using **Socket.io**, clients receive instant notifications when a new bid is placed on their gig, and freelancers are notified immediately when their bid status changes (Accepted/Rejected), creating a highly responsive marketplace experience.

---

## 🗄 Database Schema

### User Model
```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  role         Role     @default(FREELANCER)
  
  gigsCreated  Gig[]    @relation("GigClient")
  bidsMade     Bid[]    @relation("BidFreelancer")
  
  createdAt    DateTime @default(now())
}

enum Role {
  CLIENT
  FREELANCER
}
```

### Gig Model
```prisma
model Gig {
  id          String   @id @default(uuid())
  title       String
  description String
  budget      Float
  deadline    DateTime
  status      GigStatus @default(OPEN)
  
  clientId    String
  client      User     @relation("GigClient", fields: [clientId], references: [id])
  bids        Bid[]
  
  createdAt   DateTime @default(now())
}

enum GigStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### Bid Model
```prisma
model Bid {
  id           String    @id @default(uuid())
  amount       Float
  proposal     String
  status       BidStatus @default(PENDING)
  
  gigId        String
  gig          Gig       @relation(fields: [gigId], references: [id])
  
  freelancerId String
  freelancer   User      @relation("BidFreelancer", fields: [freelancerId], references: [id])
  
  createdAt    DateTime  @default(now())
}

enum BidStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

---

## 🔌 Socket.io Events

| Event | Payload | Description |
|-------|---------|-------------|
| `gig:created` | `{ gig }` | Broadcast to all freelancers |
| `bid:placed` | `{ gigId, bid }` | Sent to the Gig Client |
| `bid:updated` | `{ bidId, status }` | Sent to the Freelancer |

---

## 📄 License

MIT License

---

## 👤 Author

Amit Parmar
