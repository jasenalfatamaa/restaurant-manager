# Rustic Roots - Restaurant Management System

A modern, full-stack restaurant management application featuring a delightful guest experience and a powerful admin portal.

## 🚀 Overview

Rustic Roots is designed to streamline restaurant operations, from table selection and order management to kitchen processing and real-time status tracking.

### Key Features

- **Guest Experience**:
  - Interactive Table Selection (Landing Page).
  - Digital Menu with smart quantity logic and modifier support.
  - Real-time Order Status tracking with progress indicators.
  - Optional special instructions (Notes) support.
- **Admin Portal**:
  - **POS (Point of Sale)**: Manage payments and track active table sessions.
  - **Kitchen Display (KDS)**: Real-time order queue with detailed modifier and note visibility.
  - **Dashboard**: High-level overview of restaurant performance.
  - **Menu Management**: Dynamic control over categories and products.
- **Reliability**:
  - Offline-first persistence via LocalStorage.
  - Robust session recovery for guest tables.
  - Geofencing support for location-based order validation.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Framer Motion.
- **Icons**: Lucide React.
- **Charts**: Recharts.
- **State Management**: React Context API.
- **Testing**: Vitest, React Testing Library.

## 📦 Installation & Setup

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd restaurant-manager
   ```

2. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🧪 Testing

The frontend includes a comprehensive automated QA suite using Vitest and React Testing Library.

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Check code coverage
npm run test:coverage
```

## 🏗️ Architecture

The project follows a modular frontend architecture:
- `frontend/pages/`: Page components grouped by domain (customer/admin).
- `frontend/context/`: Global state management.
- `frontend/services/`: API interaction layer.
- `frontend/types/`: Shared TypeScript interfaces.

## 📄 License

MIT License
