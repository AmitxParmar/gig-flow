# GigFlow Server

The backend API for the GigFlow freelancing marketplace. Built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT (Cookie-based), bcrypt
- **Real-time:** Socket.io
- **Validation:** Zod / Class Validator
- **Logging:** Winston

## Key Features

- **Authentication:** User registration, login, logout, profile management. Safe handling of user data.
- **Gig Management:** Create, read, update, delete gigs.
- **Bidding System:** Freelancers can place bids; Owners can hire freelancers. Real-time updates via websockets.
- **Notifications:** Real-time notifications for bids, hiring status, and system alerts.
- **Strict Typing:** TypeScript used throughout for type safety.

## Hiring Transaction Flow

The hiring process is a critical atomic transaction ensuring data integrity:


```mermaid
sequenceDiagram
    participant O as "Owner"
    participant S as "Server (BidService)"
    participant DB as "MongoDB (Transaction)"
    participant N as "NotificationService"
    participant F1 as "Hired Freelancer"
    participant F2 as "Other Freelancers"

    O->>S: "Hire Freelancer (BidID)"
    S->>DB: "Start Session"
    
    rect #141414
        note right of S: Atomic Transaction
        S->>DB: "Check Gig Status (OPEN?)"
        S->>DB: "Update Bid Status: HIRED"
        S->>DB: "Update Other Bids: REJECTED"
        S->>DB: "Update Gig Status: ASSIGNED"
    end
    
    alt Success
        S->>DB: "Commit Transaction"
        S->>N: "Notify Hired Freelancer"
        N-->>F1: "You are hired!"
        S->>N: "Notify Rejected Freelancers"
        N-->>F2: "Bid rejected"
        S-->>O: "Success Response"
    else Failure / Race Condition
        S->>DB: "Abort Transaction"
        S-->>O: "Error (Gig no longer available)"
    end
```



## Setup & Installation

1.  **Install Dependencies:**
    ```bash
    pnpm install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the `server` directory based on `.env.example` (if available) or ensuring the following:
    ```env
    PORT=8000
    MONGO_URI=mongodb://localhost:27017/gig-flow
    JWT_SECRET=your_jwt_secret
    JWT_REFRESH_SECRET=your_refresh_secret
    NODE_ENV=development
    CLIENT_URL=http://localhost:3000
    ```

3.  **Run Development Server:**
    ```bash
    pnpm run dev
    ```


## API Documentation

- **Swagger UI:** Available at `http://localhost:8000/v1/swagger` when running locally.
- **Base URL:** `http://localhost:8000/api/v1/development`

## Project Structure

- `src/modules`: Feature-based architecture (Auth, User, Gig, Bid, Notification).
- `src/models`: Mongoose schemas.
- `src/middlewares`: Auth checks, error handling, validation.
- `src/lib`: Core utilities (logger, socket, api).
