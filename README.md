# TheViewMint

TheViewMint is a marketplace connecting Brands and Content Creators where creators are paid based on their views across platforms.

## Prerequisites
- Node.js (v18+)
- MongoDB running locally or a remote MongoDB URI.

## Setup Instructions

1. **Backend Server Setup**
```bash
cd server
npm install
# Set up your .env file with MONGO_URI, JWT_SECRET, PORT
npm start
# or for development: npm run dev
```

2. **Frontend Client Setup**
```bash
cd client
npm install
# Make sure .env has VITE_API_URL pointing to the server
npm run dev
```

## Features
- Dynamic landing page with rotating animated tabs.
- Creator and Brand Dashboards.
- Campaign creation and submission features with earnings calculation based on Pay-Per-View.
- Real views and mock analytics update capability.

## Tech Stack
- Frontend: Vite JS, React, Tailwind CSS, Lucide Icons
- Backend: Node.js, Express, MongoDB (Mongoose), JWT Auth
# theviewmint
