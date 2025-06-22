# E-Commerce Platform

A full-stack e-commerce platform built with Next.js, Express.js, and MongoDB. Features include user authentication, product management, shopping cart, order processing, and admin dashboard.


### User Features
- User registration (redirects to login page after successful registration)
- User authentication and login
- Product browsing with filters and search
- Shopping cart functionality
- Order placement and tracking
- User dashboard with order history
- Product reviews and ratings

### Admin Features
- Admin dashboard with analytics
- Product management (CRUD operations)
- Order management and status updates
- User management
- Sales reports and charts

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **Formik & Yup** - Form handling and validation
- **React Hot Toast** - Notifications

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Start the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

#### Start Frontend Application
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

## 👤 Default Admin Credentials

When the server starts for the first time, a default admin account is automatically created:

**Email:** `admin@example.com`
**Password:** `Admin123!`

> ⚠️ **Important:** Change these credentials immediately after first login for security purposes.

### Additional Test Account

A test user account is also created for testing purposes:

**Email:** `user@example.com`
**Password:** `User123!`
**Role:** `user`

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Set environment variables in your hosting platform
2. Ensure MongoDB connection string is configured
3. Deploy the backend directory

### Frontend Deployment (Vercel/Netlify)
1. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL
2. Deploy the frontend directory
3. Configure build settings: `npm run build`

### Render Deployment Fix
If you encounter the error "Publish directory ./next does not exist!" on Render:

1. **Set the correct publish directory:** `.next` (with a dot)
2. **Build command:** `npm run build`
3. **Start command:** `npm start`
4. **Root directory:** Set to `frontend` if deploying only the frontend

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 API Documentation

The API follows RESTful conventions. Key endpoints include:

- `POST /api/auth/register` - User registration (returns success message, requires separate login)
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/products` - Get products with filters
- `POST /api/cart/add` - Add item to cart
- `POST /api/orders` - Create order
- `GET /api/admin/analytics` - Admin analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues
- **MongoDB Connection Error:** Ensure MongoDB is running and connection string is correct
- **JWT Secret Error:** Make sure JWT_SECRET is set in environment variables
- **Port Already in Use:** Change the PORT in .env or kill the process using the port

#### Frontend Issues
- **API Connection Error:** Verify NEXT_PUBLIC_API_URL points to running backend
- **Build Errors:** Clear `.next` folder and rebuild: `rm -rf .next && npm run build`
- **TypeScript Errors:** Run `npm run lint` to check for type issues

### Database Seeding

#### Automatic Admin Creation
The application automatically creates a default admin user when the server starts for the first time. This is handled by the `createAdminSeeder` function that runs during server initialization.

#### Manual Admin Creation
You can also manually create an admin user by running:
```bash
cd backend
npm run seed:admin
```

#### Sample Data Seeding
To populate the database with sample data:
```bash
cd backend
npm run seed
```

This will create:
- Sample products across different categories
- Test user accounts
- Sample orders and reviews

> **Note:** The admin seeder only creates an admin user if none exists in the database, preventing duplicate admin accounts.
