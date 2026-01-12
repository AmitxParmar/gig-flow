# GigFlow - Frontend

A mini-freelance marketplace platform built with React, TypeScript, and Tailwind CSS. GigFlow enables Clients to post job opportunities (Gigs) and Freelancers to submit applications (Bids), featuring real-time updates and a streamlined workflow for project management.

## 🚀 Features

- **Authentication**: Secure login and registration with JWT handling using HTTP-only cookies (via backend).
- **Real-Time Marketplace**: Instant updates on new gigs, bid submissions, and status changes via Socket.io.
- **Responsive Design**: Mobile-first architecture using Tailwind CSS for a seamless experience across devices.
- **Optimized Data Fetching**: Powered by TanStack Query for efficient caching, synchronization, and server state management.

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Framework** | [React](https://react.dev/) (Vite) | UI Library |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type Safety |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |
| **State Management** | [TanStack Query](https://tanstack.com/query/latest) | Server State / Caching |
| **Routing** | [TanStack Router](https://tanstack.com/router) | Client-side Routing |
| **Real-Time** | [Socket.io Client](https://socket.io/) | WebSocket Communication |
| **HTTP Client** | [Axios](https://axios-http.com/) | API Requests |
| **Icons** | [Lucide React](https://lucide.dev/) | Iconography |

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (recommended) or npm

### Installation

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Start the development server:**
    ```bash
    pnpm run dev
    ```
    The application will be available at `http://localhost:3000`.

## 🏗 Architecture & Design Decisions

### Component Structure
- **routes/**: File-based routing definitions (TanStack Router).
- **components/**: Reusable UI components following atomic design principles.
  - `ui/`: Core generic components (buttons, inputs, cards).
  - `features/`: Business-logic specific components (`GigCard`, `BidForm`, `MarketplaceFilters`).
- **hooks/**: Custom React hooks (e.g., `useGigs`, `useBids`, `useAuth`) incorporating React Query logic.
- **services/**: API interaction layer, separated from UI components to enable easy testing and logic reuse.

### State Management Strategy
- **Server State**: Managed entirely by **TanStack Query**. This handles the marketplace data (Gigs and Bids), providing out-of-the-box caching, loading states, and background refetching.
- **Local State**: Handled by React `useState` and `useReducer` for UI-specific state (modals, form inputs, filter toggles).

## 🤝 Socket.io Integration

The client initializes a socket connection upon authentication to listen for marketplace activity:
- `gig:created`: Notifies freelancers of new opportunities.
- `bid:placed`, `bid:updated`: Updates clients on new applications or status changes.
- `notification`: Displays real-time alerts for bid acceptances or gig milestones.

## 🧪 Testing

Run unit and integration tests via Vitest:
```bash
pnpm test
```

## 📦 Build

To create a production-ready build:
```bash
pnpm run build
```
