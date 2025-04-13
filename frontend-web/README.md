# PERN Financial Management

## Project Setup Guide

### Prerequisites

- Node.js (>=14.x)
- npm (>=6.x) or yarn (>=1.x)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/githubnext/workspace-blank.git
   cd workspace-blank
   ```

2. Install dependencies:

   ```sh
   npm install
   # or
   yarn install
   ```

3. Start the development server:

   ```sh
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### Project Structure

```plaintext
📦 pern-financial-management/
 ┣──📁 client/                  # Frontend application
    ┣ 📂 public/                # Static assets
    ┃ ┣ 📄 favicon.ico          # Site favicon
    ┃ ┗ 📄 index.html           # Main HTML entry point
    ┣ 📂 src/
    ┃ ┣ 📂 assets/              # Static resources
    ┃ ┃ ┣ 📂 images/            # Image assets
    ┃ ┃ ┣ 📂 icons/             # Icon assets
    ┃ ┃ ┗ 📂 fonts/             # Custom fonts
    ┃ ┣ 📂 components/          # Reusable UI components
    ┃ ┃ ┣ 📂 common/            # Generic components
    ┃ ┃ ┃ ┣ 📄 Navbar.tsx       # Navigation bar
    ┃ ┃ ┃ ┣ 📄 Footer.tsx       # Footer component
    ┃ ┃ ┃ ┣ 📄 Sidebar.tsx      # Sidebar navigation
    ┃ ┃ ┃ ┗ 📄 Loader.tsx       # Loading indicator
    ┃ ┃ ┣ 📂 auth/              # Authentication components
    ┃ ┃ ┃ ┣ 📄 LoginForm.tsx    # User login form
    ┃ ┃ ┃ ┣ 📄 RegisterForm.tsx # User registration
    ┃ ┃ ┃ ┗ 📄 TwoFactorAuth.tsx # 2FA implementation
    ┃ ┃ ┣ 📂 transactions/      # Transaction components
    ┃ ┃ ┃ ┣ 📄 TransactionForm.tsx  # Create/edit transaction
    ┃ ┃ ┃ ┣ 📄 TransactionList.tsx  # List transactions
    ┃ ┃ ┃ ┗ 📄 TransactionFilter.tsx # Filter transactions
    ┃ ┃ ┣ 📂 goals/             # Saving goals components
    ┃ ┃ ┃ ┣ 📄 GoalForm.tsx     # Create/edit financial goal
    ┃ ┃ ┃ ┗ 📄 GoalProgress.tsx # Display goal progress
    ┃ ┃ ┣ 📂 reports/           # Report components
    ┃ ┃ ┃ ┣ 📄 ReportGenerator.tsx # Generate reports
    ┃ ┃ ┃ ┗ 📄 ChartComponents.tsx # Data visualization
    ┃ ┃ ┗ 📂 modals/            # Modal components
    ┃ ┃   ┣ 📄 ConfirmModal.tsx # Confirmation dialog
    ┃ ┃   ┗ 📄 AlertModal.tsx   # Alert dialog
    ┃ ┣ 📂 contexts/            # React Context API
    ┃ ┃ ┣ 📄 AuthContext.tsx    # Authentication context
    ┃ ┃ ┣ 📄 ThemeContext.tsx   # Theme (dark/light) context
    ┃ ┃ ┗ 📄 NotificationContext.tsx # Notifications
    ┃ ┣ 📂 hooks/               # Custom React hooks
    ┃ ┃ ┣ 📄 useAuth.ts         # Authentication hook
    ┃ ┃ ┣ 📄 useTransactions.ts # Transactions data hook
    ┃ ┃ ┣ 📄 useGoals.ts        # Financial goals hook
    ┃ ┃ ┣ 📄 useReports.ts      # Reports generation hook
    ┃ ┃ ┗ 📄 useDarkMode.ts     # Theme toggle hook
    ┃ ┣ 📂 layouts/             # Layout components
    ┃ ┃ ┣ 📄 DashboardLayout.tsx # Dashboard layout
    ┃ ┃ ┣ 📄 AdminLayout.tsx    # Admin panel layout
    ┃ ┃ ┗ 📄 AuthLayout.tsx     # Authentication pages layout
    ┃ ┣ 📂 pages/               # Page components
    ┃ ┃ ┣ 📂 auth/              # Authentication pages
    ┃ ┃ ┃ ┣ 📄 Login.tsx        # Login page
    ┃ ┃ ┃ ┣ 📄 Register.tsx     # Registration page
    ┃ ┃ ┃ ┣ 📄 TwoFactorVerification.tsx # 2FA verification
    ┃ ┃ ┃ ┗ 📄 ForgotPassword.tsx # Password recovery
    ┃ ┃ ┣ 📂 dashboard/         # Dashboard pages
    ┃ ┃ ┃ ┣ 📄 Overview.tsx     # Financial overview
    ┃ ┃ ┃ ┣ 📄 Transactions.tsx # Transaction management
    ┃ ┃ ┃ ┗ 📄 SavingGoals.tsx  # Goals dashboard
    ┃ ┃ ┣ 📂 admin/             # Admin pages
    ┃ ┃ ┃ ┣ 📄 UserManagement.tsx # Manage users
    ┃ ┃ ┃ ┗ 📄 RoleManagement.tsx # Manage roles/permissions
    ┃ ┃ ┣ 📂 reports/           # Financial reports
    ┃ ┃ ┃ ┣ 📄 Analytics.tsx    # Reports & analytics
    ┃ ┃ ┃ ┗ 📄 ViewReports.tsx  # View saved reports
    ┃ ┃ ┗ 📂 settings/          # User settings
    ┃ ┃   ┣ 📄 UserSettings.tsx # User profile
    ┃ ┃   ┗ 📄 SecuritySettings.tsx # Security settings
    ┃ ┣ 📂 router/              # Routing configuration
    ┃ ┃ ┣ 📄 ProtectedRoute.tsx # Auth protection HOC
    ┃ ┃ ┣ 📄 AdminRoute.tsx     # Admin route protection
    ┃ ┃ ┗ 📄 AppRouter.tsx      # Main router configuration
    ┃ ┣ 📂 services/            # API services
    ┃ ┃ ┣ 📄 api.ts             # Axios instance & interceptors
    ┃ ┃ ┣ 📄 authService.ts     # Authentication API calls
    ┃ ┃ ┣ 📄 userService.ts     # User management API calls
    ┃ ┃ ┣ 📄 transactionService.ts # Transaction API calls
    ┃ ┃ ┣ 📄 goalService.ts     # Goals API calls
    ┃ ┃ ┗ 📄 reportService.ts   # Reports API calls
    ┃ ┣ 📂 store/               # State management (using Zustand)
    ┃ ┃ ┣ 📄 authStore.ts       # Authentication state
    ┃ ┃ ┣ 📄 transactionStore.ts # Transactions state
    ┃ ┃ ┗ 📄 uiStore.ts         # UI state
    ┃ ┣ 📂 types/               # TypeScript type definitions
    ┃ ┃ ┣ 📄 auth.types.ts      # Authentication types
    ┃ ┃ ┣ 📄 transaction.types.ts # Transaction types
    ┃ ┃ ┣ 📄 goal.types.ts      # Goal types
    ┃ ┃ ┣ 📄 report.types.ts    # Report types
    ┃ ┃ ┗ 📄 user.types.ts      # User types
    ┃ ┣ 📂 utils/               # Utility functions
    ┃ ┃ ┣ 📄 formatters.ts      # Data formatters (currency, date)
    ┃ ┃ ┣ 📄 validators.ts      # Form validation functions
    ┃ ┃ ┣ 📄 permissions.ts     # RBAC helper functions
    ┃ ┃ ┗ 📄 storage.ts         # Local storage utilities
    ┃ ┣ 📂 constants/           # Application constants
    ┃ ┃ ┣ 📄 apiEndpoints.ts    # API endpoint constants
    ┃ ┃ ┣ 📄 roles.ts           # Role definitions
    ┃ ┃ ┗ 📄 theme.ts           # Theme constants
    ┃ ┣ 📂 config/              # Configuration
    ┃ ┃ ┣ 📄 environment.ts     # Environment variables
    ┃ ┃ ┗ 📄 theme.ts           # Theme configuration
    ┃ ┣ 📄 App.tsx              # Root component
    ┃ ┗ 📄 main.tsx             # Application entry point
    ┣ 📄 index.html             # Main HTML file
    ┣ 📄 tsconfig.json          # TypeScript configuration
    ┣ 📄 tsconfig.node.json     # TypeScript Node configuration
    ┣ 📄 package.json           # Dependencies
    ┣ 📄 vite.config.ts         # Vite configuration
    ┗ 📄 eslint.config.js       # ESLint configuration
```

## Contribution Guidelines

We welcome contributions from the community! Please follow these guidelines to contribute to the project:

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Create a pull request.

## Testing

### Unit Tests

Unit tests are located in the `tests/unit` directory. To run the unit tests, use the following command:

```sh
npm run test:unit
# or
yarn test:unit
```

### Integration Tests

Integration tests are located in the `tests/integration` directory. To run the integration tests, use the following command:

```sh
npm run test:integration
# or
yarn test:integration
```

### End-to-End Tests

End-to-end tests are located in the `tests/e2e` directory. To run the end-to-end tests, use the following command:

```sh
npm run test:e2e
# or
yarn test:e2e
```

### Storybook

To start Storybook and view the UI components in isolation, use the following command:

```sh
npm run storybook
# or
yarn storybook
```

### Linting

To lint the codebase, use the following command:

```sh
npm run lint
# or
yarn lint
```

### Formatting

To format the codebase, use the following command:

```sh
npm run format
# or
yarn format
```

## Suggested Implementation Order

1. Core infrastructure and auth system
2. Main UI components and layouts
3. Transaction management
4. Financial goals
5. Reporting
6. Admin features
7. Settings
8. Testing and optimization
