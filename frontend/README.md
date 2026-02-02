# ITFM System - IT Facilities Management

A full-stack ticket management system for IT facilities management with role-based access control.

## Features

- **Multi-role Authentication**: Admin, Engineer, and User roles
- **Ticket Management**: Create, assign, track, and resolve tickets
- **Real-time Notifications**: Get notified about ticket updates
- **Dark Mode**: Toggle between light and dark themes
- **Engineer Workload**: Track and manage engineer assignments
- **Reassignment Requests**: Engineers can request ticket reassignment

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS v4
- Framer Motion (animations)
- Lucide React (icons)
- Axios (HTTP client)
- React Hot Toast (notifications)

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- express-validator (input validation)

## Prerequisites

- Node.js v18 or higher
- MongoDB (local installation or MongoDB Atlas)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd itfm-system
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Configure Environment Variables

**Backend** (create `backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/itfm_system
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (create `.env` in root):
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Seed the Database (Create Admin User)
```bash
cd backend
npm run seed
```

This creates a default admin user:
- Email: admin@itfm.local
- Password: admin123

## Running the Application

### Start MongoDB
Make sure MongoDB is running on your system.

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:5000

### Start Frontend Development Server
```bash
# In the root directory
npm run dev
```
The frontend will run on http://localhost:5173

## User Roles

### Admin
- View all tickets
- Assign tickets to engineers
- Set ticket severity
- Handle reassignment requests
- View engineer workload

### Engineer
- View assigned tickets
- Start progress on tickets
- Add action logs
- Mark tickets as resolved
- Request reassignment

### User
- Create new tickets
- Track ticket status
- View ticket progress and action logs

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user

### Tickets
- GET `/api/tickets` - Get all tickets (role-filtered)
- POST `/api/tickets` - Create ticket
- GET `/api/tickets/:id` - Get single ticket
- PUT `/api/tickets/:id/assign` - Assign ticket (Admin)
- PUT `/api/tickets/:id/status` - Update status
- POST `/api/tickets/:id/logs` - Add action log
- POST `/api/tickets/:id/reassign-request` - Request reassignment
- PUT `/api/tickets/:id/reassign-request` - Handle reassignment

### Users
- GET `/api/users` - Get all users (Admin)
- GET `/api/users/engineers` - Get all engineers
- GET `/api/users/workload` - Get engineer workload

### Notifications
- GET `/api/notifications` - Get user notifications
- PUT `/api/notifications/:id/read` - Mark as read
- DELETE `/api/notifications` - Clear all

## Production Deployment

### Build Frontend
```bash
npm run build
```

### Backend Production
Update `backend/.env`:
```env
NODE_ENV=production
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=<your-frontend-domain>
```

## License

MIT
