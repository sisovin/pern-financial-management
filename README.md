# Pern Financial Management
The project is a complete Financial Management System built using JWT authentication, and RESTful APIs. The project handles user authentication (Argon2, soft-delete Design, Redis caching client), transactions, saving goals, financial reports, and admin controls—all developed from scratch.

## **Features**
- User Authentication (JWT-based login & signup, Argon2, soft-delete Design, Redis caching client)
- How two-factor authentication work from the attached image.
- Transactions (Income, Expenses, Savings) Management
- Saving Goals Module 🎯
- Role-Based Access (User & Admin functionalities), permission 
- Detailed Financial Reports & API Testing with Postman

## **Tech Stack**
- PostgreSQL
- Prisma
- JWT
- REST API

## **📂 Project Structure**
```
pern-financial-management/
│── 📁 src/
│   │── 📁 config/            # Configuration files
│   │   │── db.js             # PostgreSQL database connection (Prisma)
│   │   │── redis.js          # Redis caching client setup
│   │   └── dotenv.js         # Environment variables setup
│   │── 📁 middleware/        # Authentication & authorization middleware
│   │   │── authMiddleware.js # JWT & Role-Based Access (RBAC)
│   │   └── rateLimit.js      # Rate limiting (security)
│   │── 📁 routes/            # API routes (Modular)
│   │   │── authRoutes.js     # Signup, login, JWT, 2FA
│   │   │── userRoutes.js     # User profile & account actions
│   │   │── transactionRoutes.js # Income, expenses, savings
│   │   │── goalRoutes.js     # Financial saving goals
│   │   │── adminRoutes.js    # Admin controls (User management)
│   │   └── reportRoutes.js   # Financial reports (CSV, PDF exports)
│   │── 📁 controllers/       # Business logic (separates concerns)
│   │   │── authController.js # Auth logic (JWT, Argon2, Redis, 2FA)
│   │   │── userController.js # User-related functions
│   │   │── transactionController.js # Transactions handling
│   │   │── goalController.js # Savings goal management
│   │   │── adminController.js # Admin-related functions
│   │   └── reportController.js # Financial reports generation
│   │── 📁 utils/             # Utility functions
│   │   │── jwt.js            # JWT helper functions
│   │   │── email.js          # Email sending for OTP
│   │   │── logger.js         # Logging system
│   │   └── argon2.js         # Argon2 password hashing (renamed from bcrypt)
│   │── 📁 services/          # Business logic services
│   │   │── authService.js    # Authentication service
│   │   │── userService.js    # User service (added)
│   │   │── transactionService.js # Financial transactions service
│   │   │── goalService.js    # Goal service (added)
│   │   └── reportService.js  # Report generation service
│   │── 📁 validators/        # Input validation (added)
│   │   │── authValidator.js  # Validate auth inputs
│   │   │── userValidator.js  # Validate user inputs
│   │   └── transactionValidator.js # Validate transaction inputs
│   │── app.js                # Express server setup
│   └── server.js             # Entry point
│── 📁 prisma/                # Prisma configuration
│   │── schema.prisma         # Database schema definition (all models)
│   └── migrations/           # Database migrations
│── 📁 tests/                 # API testing (Jest, Supertest)
│   │── auth.test.js          # Test authentication flow
│   │── transactions.test.js  # Test transactions API
│   └── reports.test.js       # Test financial reports API
│── 📁 docs/                  # API documentation (Swagger/Postman)
│── .env                      # Environment variables
│── .gitignore                # Ignore sensitive files
│── package.json              # Project metadata & dependencies
│── README.md                 # Project documentation
```
