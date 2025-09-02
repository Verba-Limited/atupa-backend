# Atupa Backend - Microservices API

Backend microservices for the Atupa Yoruba learning mobile application.

## Architecture

This backend uses a microservices architecture with the following services:

- **API Gateway** (Port 3000) - Main entry point, routes requests to microservices
- **Auth Service** (Port 3001) - User authentication, registration, JWT tokens
- **User Service** (Port 3002) - User profiles, preferences, settings
- **Quiz Service** (Port 3003) - Quiz questions, categories, content management  
- **Progress Service** (Port 3004) - User progress tracking, achievements, streaks
- **Leaderboard Service** (Port 3005) - Rankings, competitions, social features
- **Subscription Service** (Port 3006) - Payment plans, billing, Stripe integration
- **Notification Service** (Port 3007) - Push notifications, announcements
- **Content Service** (Port 3008) - Lessons, media content, resources

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer
- **Payment**: Stripe
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Redis (optional, for caching)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd atupa-backend
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Build the TypeScript code
```bash
npm run build
```

### Running the Services

#### Development Mode

Run all services concurrently:
```bash
npm run dev:services
```

Or run individual services:
```bash
npm run dev:auth    # Auth service only
npm run dev:user    # User service only  
npm run dev:quiz    # Quiz service only
# etc.
```

#### Production Mode

```bash
npm run build
npm start
```

### API Documentation

#### API Gateway Endpoints

All requests go through the API Gateway at `http://localhost:3000`

Base URL: `http://localhost:3000/api/v1`

#### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/google-login` - Google OAuth login
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/logout` - Logout user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/verify-email/:token` - Verify email address
- `POST /auth/change-password` - Change password (authenticated)
- `GET /auth/profile` - Get user profile (authenticated)

#### Quiz Endpoints

- `GET /quiz/categories` - Get all quiz categories
- `GET /quiz/categories/:id` - Get category by ID
- `GET /quiz/category/:categoryId` - Get quizzes by category
- `GET /quiz/category/:categoryId/level/:level` - Get quizzes by level
- `GET /quiz/:id` - Get quiz by ID
- `GET /quiz/random` - Get random quiz questions
- `GET /quiz/stats` - Get quiz statistics
- `POST /quiz/submit-answer` - Submit quiz answer (authenticated)

#### User Endpoints

- `GET /users/profile` - Get user profile (authenticated)
- `PUT /users/profile` - Update user profile (authenticated)
- `PUT /users/preferences` - Update user preferences (authenticated)
- `POST /users/profile/image` - Upload profile image (authenticated)
- `GET /users/public/:userId` - Get public user profile

#### Progress Endpoints

- `GET /progress` - Get user's overall progress (authenticated)
- `GET /progress/category/:categoryId` - Get progress for category (authenticated)
- `POST /progress/update` - Update progress after quiz (authenticated)
- `GET /progress/attempts` - Get quiz attempt history (authenticated)
- `GET /progress/stats` - Get user statistics (authenticated)
- `DELETE /progress/category/:categoryId/reset` - Reset category progress (authenticated)

### Database Seeding

For development, you can seed the quiz data:

```bash
curl -X POST http://localhost:3003/seed
```

This will populate the database with quiz questions and categories from the mobile app.

### Environment Variables

Key environment variables to configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/atupa

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# Service Ports
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
QUIZ_SERVICE_PORT=3003
PROGRESS_SERVICE_PORT=3004
# ... etc

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

### Health Checks

Each service provides a health check endpoint:

- API Gateway: `GET http://localhost:3000/health`
- Auth Service: `GET http://localhost:3001/health`
- User Service: `GET http://localhost:3002/health`
- Quiz Service: `GET http://localhost:3003/health`
- Progress Service: `GET http://localhost:3004/health`

### Security Features

- **Rate Limiting**: Different limits for auth vs general endpoints
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Account Lockout**: Protection against brute force attacks
- **CORS**: Configured for mobile app origins
- **Helmet**: Security headers middleware
- **Input Validation**: express-validator for request validation

### Development

The backend is structured for easy development and testing:

- TypeScript for type safety
- Shared utilities and middleware
- Modular microservices architecture
- Comprehensive error handling
- Request/response logging
- Database connection management

### Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Configure production database and secrets
3. Use a process manager like PM2
4. Set up reverse proxy (nginx)
5. Configure SSL certificates
6. Set up monitoring and logging

## Contributing

1. Follow TypeScript and Express.js best practices
2. Add proper error handling and validation
3. Include comprehensive logging
4. Write clear API documentation
5. Test all endpoints thoroughly
