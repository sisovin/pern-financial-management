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
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** PostgreSQL
- **Security:** JWT (JSON Web Token), Argon2 for password hashing, Redis for caching
- **Authentication:** Two-Factor Authentication (2FA) (Biometric, OTP, Authenticator App)
- **API Testing:** Postman

## **📂 Project Structure**
Here’s the **full project structure** for your **Financial Management System** built using **Node.js, PostgreSQL, Prisma, JWT, RESTful APIs**, and **2FA authentication**.
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
│   │   │── authRoutes.js     # Signup, login, JWT, 2FA, password reset
│   │   │── userRoutes.js     # User profile & account actions
│   │   │── transactionRoutes.js # Income, expenses, savings
│   │   │── goalRoutes.js     # Financial saving goals
│   │   │── adminRoutes.js    # Admin controls (User management)
│   │   └── reportRoutes.js   # Financial reports (CSV, PDF exports)
│   │── 📁 controllers/       # Business logic (separates concerns)
│   │   │── authController.js # Auth logic (JWT, Argon2, Redis, 2FA, password reset)
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
│   
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
└── server.js                 # Entry point
```
## **📌 Step-by-Step Development Plan**
1️⃣ **Initialize project**  
```sh
mkdir financial-management && cd financial-management
npm init -y
```

2️⃣ **Install dependencies**  
```sh
npm install express prisma @prisma/client bcryptjs jsonwebtoken redis dotenv cors nodemailer jest supertest
```

3️⃣ **Setup Prisma for PostgreSQL**  
```sh
npx prisma init
```
Modify `prisma/schema.prisma` to define models (User, Transactions, Goals).

4️⃣ **Generate Prisma migration**  
```sh
npx prisma migrate dev --name init
```

5️⃣ **Start the server**  
```sh
npm run dev
```
## **📌 Key Features Covered**
✅ **JWT Authentication** (Argon2, Redis caching)  
✅ **Two-Factor Authentication (2FA)** (OTP, Biometric, Authenticator App)  
✅ **Transactions Management** (Income, Expenses, Savings)  
✅ **Saving Goals 🎯**  
✅ **Role-Based Access Control (RBAC)** (User & Admin)  
✅ **Financial Reports** (Analytics, CSV, PDF)  
✅ **API Testing with Postman/Jest**  

Developing a comprehensive **Financial Management System** involves implementing several key modules. Below is a step-by-step guide to implementing each module using **Node.js**, **PostgreSQL**, **Prisma**, **JWT**, and **RESTful APIs**.

---

## **1️⃣ User Authentication Module**

**Features:**
- **User Registration & Login:** Secure user signup and login using **JWT**.
- **Password Hashing:** Utilize **Argon2** for password hashing.
- **Soft-Delete Design:** Implement soft-delete functionality for user accounts.
- **Session Management:** Use **Redis** for caching and session management.
- **Two-Factor Authentication (2FA):** Implement 2FA using OTPs sent via email or SMS.
- **Password Reset:** Implement password reset functionality.

**Implementation Steps:**

1. **Set Up Prisma Models:**
- Define the each model in your Prisma schema
- Run `npx prisma migrate dev --name init` to apply the changes.

2. **Implement Registration:**
   - Hash passwords using **Argon2** before storing them in the database.
   - Save user details in the `User` table.

3. **Implement Login:**
   - Verify the user's credentials.
   - Generate a **JWT** for authenticated sessions.
   - Store session information in **Redis** for quick access.

4. **Implement Soft-Delete:**
   - Instead of deleting user records, set the `isDeleted` flag to `true`.
   - Modify queries to filter out users where `isDeleted` is `true`.

5. **Implement Two-Factor Authentication (2FA):**
   - Generate a secret for 2FA and store it in the `twoFactorSecret` field.
   - Use a library like `speakeasy` to generate and verify OTPs.
   - During login, if 2FA is enabled, prompt the user for the OTP.

6. **Implement Password Reset:**
   - Create a password reset token and store it in the database.
   - Send a password reset link to the user's email.
   - Verify the token and allow the user to reset their password.

## **2️⃣ Password Reset Feature**

**Features:**
- **Forgot Password:** Allow users to request a password reset link via email.
- **Reset Password:** Allow users to reset their password using the link sent to their email.

**Implementation Steps:**

1. **Frontend:**
   - Create a `ForgotPassword` component with a form to enter the email.
   - Create a `PasswordReset` component with a form to enter the new password.
   - Add routes for `ForgotPassword` and `PasswordReset` components in the router configuration.

2. **Backend:**
   - Add routes for password reset and forgot password in `authRoutes.js`.
   - Implement `passwordReset` and `forgotPassword` controller functions in `authController.js`.
   - Update the API documentation to include new endpoints for password reset and forgot password.

3. **Documentation:**
   - Update the `README.md` to specify the inclusion of password reset in the authentication flow.
   - Add instructions for using the password reset feature.

## **📂 Updated Project Structure**
Here’s the **updated project structure** for your **Financial Management System** built using **Node.js, PostgreSQL, Prisma, JWT, RESTful APIs**, and **2FA authentication**.
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
│   │   │── authRoutes.js     # Signup, login, JWT, 2FA, password reset
│   │   │── userRoutes.js     # User profile & account actions
│   │   │── transactionRoutes.js # Income, expenses, savings
│   │   │── goalRoutes.js     # Financial saving goals
│   │   │── adminRoutes.js    # Admin controls (User management)
│   │   └── reportRoutes.js   # Financial reports (CSV, PDF exports)
│   │── 📁 controllers/       # Business logic (separates concerns)
│   │   │── authController.js # Auth logic (JWT, Argon2, Redis, 2FA, password reset)
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
│   
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
└── server.js                 # Entry point
```
