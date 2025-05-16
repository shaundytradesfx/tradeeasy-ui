# TradeEasy Frontend

Real-time sentiment analytics platform for equities, FX, crypto, and commodities. This is the web UI component built with Next.js and Tailwind CSS.

## Features

- Dashboard with sentiment gauges and market overview
- Search for articles and asset sentiment data
- Watchlist for tracking favorite assets
- Alerts for sentiment threshold monitoring
- Asset detail pages with sentiment history

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components inspired by Aceternity UI
- **State Management**: React hooks

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file with the following:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Development

Start the development server:

```bash
npm run dev -- --port 3000
# or
yarn dev -- --port 3000
# or
./start.sh
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Next.js pages and routes
- `src/styles/` - Global stylesheets
- `public/` - Static assets

## Backend Integration

This frontend connects to a FastAPI backend at the URL specified in the `NEXT_PUBLIC_API_URL` environment variable. Make sure the backend server is running for full functionality.

## License

This project is part of the TradeEasy platform.
