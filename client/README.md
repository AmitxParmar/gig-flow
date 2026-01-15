# GigFlow Client

The frontend application for GigFlow, a modern freelancing marketplace.

## Tech Stack

- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (Radix Primitives)
- **State/Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Real-time:** Socket.io Client
- **Routing:** React Router DOM

## Features

- **Responsive Dashboard:** For both Clients (Owners) and Freelancers.
- **Gig Marketplace:** Browse, filter, and search for gigs.
- **Gig Management:** Create and manage your own gigs.
- **Bidding UI:** Place, edit, and view bids on gigs.
- **Dynamic Notifications:** Real-time popover notifications for important events.
- **Dark/Light Mode:** Full theme support.

## Setup & Installation

1.  **Install Dependencies:**
    ```bash
    pnpm install
    ```

2.  **Environment Variables:**
    Create a `.env` file (or `.env.local`) in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:8000/api/v1/development
    VITE_SOCKET_URL=http://localhost:8000
    ```

3.  **Run Development Server:**
    ```bash
    pnpm run dev
    ```

4.  **Build for Production:**
    ```bash
    pnpm run build
    ```

## Key Components

- **Layouts:** `DashboardLayout` for authenticated users.
- **Features:** Specific folders for `auth`, `gigs`, `bids`, `notifications`.
- **UI:** Reusable accessible components in `components/ui`.
