# GigFlow

GigFlow is a full-featured freelancing marketplace application connecting gig owners with freelancers. It features real-time bidding, notifications, and comprehensive project management tools.

## Projects

This repository contains two main projects:

-   **[Server](./server/README.md):** The backend API built with Node.js, Express, and MongoDB. Handles authentication, business logic, and real-time socket connections.
-   **[Client](./client/README.md):** The frontend application built with React, Vite, and Tailwind CSS. Provides a responsive and interactive user interface.

## Quick Start

### Option 1: Docker (Recommended for Production/Preview)

Run the entire stack with a single command. This spins up the Server (port 8000) and Client (port 3000) in production mode.

1.  **Configure Environment:**
    Ensure `server/.env` exists and contains your `DATABASE_URL` (MongoDB Atlas connection string).

2.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```

3.  **Access:**
    -   **Client:** http://localhost:3000
    -   **Server:** http://localhost:8000

---

### Option 2: Local Development (For Code Editing)

If you don't have Docker or want to develop features:

1.  **Server Setup:**
    Navigate to the `server` directory, install dependencies, and start the development server.
    ```bash
    cd server
    # Create .env file with your DATABASE_URL
    pnpm install
    pnpm run dev
    ```
    *Server runs on: http://localhost:8000*

2.  **Client Setup:**
    Navigate to the `client` directory in a new terminal.
    ```bash
    cd client
    # Create .env with VITE_API_BASE_URL=http://localhost:8000/api/v1/development
    pnpm install
    pnpm run dev
    ```
    *Client runs on: http://localhost:3000 (usually)*

Check the respective README files for detailed configuration.
