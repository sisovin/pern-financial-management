import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'

export default tseslint.config(
  { ignores: ["dist", "node_modules", "build"] },
  {
    // Base configuration for all files
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {},
      },
    },
    
    // Extend recommended configurations
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    
    // Rules that apply to all JS/TS files
    rules: {
      // Error prevention
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-debugger": "warn",
      "no-duplicate-imports": "error",
      
      // TypeScript specific
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_", 
        varsIgnorePattern: "^_" 
      }],
      
      // Modern JS features
      "prefer-const": "error",
      "prefer-destructuring": "warn",
      "prefer-template": "warn",
    },
  },
  
  // TypeScript & React specific configuration
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "react": react,
    },
    rules: {
      // React specific rules
      "react/prop-types": "off", // TypeScript handles prop validation
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/display-name": "off",
      "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
      
      // React hooks
      ...reactHooks.configs.recommended.rules,
      
      // Fast Refresh
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  
  // Style/formatting rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "linebreak-style": ["error", "windows"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "semi": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
    },
  }
);