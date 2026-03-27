# Contributing to PromptCraft Academy

Welcome! We're glad you're interested in contributing to PromptCraft Academy. This guide will get you from zero to a running local development environment as quickly as possible.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone and Install](#clone-and-install)
3. [Environment Setup](#environment-setup)
4. [Running the App Locally](#running-the-app-locally)
5. [Running the Backend](#running-the-backend)
6. [AI Provider Setup](#ai-provider-setup)
7. [Building for App Stores](#building-for-app-stores)
8. [Project Structure](#project-structure)
9. [Code Style and Standards](#code-style-and-standards)
10. [Submitting a Pull Request](#submitting-a-pull-request)

---

## Prerequisites

Before you start, make sure you have the following installed:

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | 20.x LTS or higher | Use [nvm](https://github.com/nvm-sh/nvm) to manage versions |
| **npm** | 10.x or higher | Comes with Node.js |
| **Git** | 2.40+ | — |
| **Expo CLI** | Latest | `npm install -g expo` |
| **EAS CLI** | Latest | `npm install -g eas-cli` (for store builds only) |
| **Expo Go** | Latest | Install on your phone from the App Store / Google Play |

**For iOS development (macOS only):**
- Xcode 15 or higher
- Xcode Command Line Tools: `xcode-select --install`
- iOS Simulator (included with Xcode)
- CocoaPods: `sudo gem install cocoapods`

**For Android development:**
- Android Studio (Flamingo or higher)
- Android SDK 33+
- A connected Android device or configured Android Emulator
- Ensure `ANDROID_HOME` is set in your environment

---

## Clone and Install

```bash
# Clone the repository
git clone https://github.com/promptcraft/promptcraft-academy.git
cd promptcraft-academy

# Install dependencies
npm install
```

If you're working on the backend as well:

```bash
cd backend
npm install
cd ..
```

---

## Environment Setup

The app uses environment variables for configuration. We use a `.env` file for local development (never commit this file — it is in `.gitignore`).

### 1. Copy the example file

```bash
cp .env.example .env
```

### 2. Fill in the required values

Open `.env` in your editor and set the following:

```dotenv
# ─── App API ─────────────────────────────────────────────────────────────────
# URL of the backend API server (local development default)
EXPO_PUBLIC_API_URL=http://localhost:3000

# ─── AI Providers ────────────────────────────────────────────────────────────
# Anthropic Claude API — used for primary AI responses
# Get your key at: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Groq API — used for fast inference on lighter tasks
# Get your key at: https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# ─── Authentication ───────────────────────────────────────────────────────────
# JWT secret for signing session tokens (any long random string for local dev)
JWT_SECRET=your_long_random_jwt_secret_here

# ─── Database ─────────────────────────────────────────────────────────────────
# PostgreSQL connection string
DATABASE_URL=postgresql://localhost:5432/promptcraft_dev

# ─── Optional: Notifications ─────────────────────────────────────────────────
# Expo push notification credentials (only needed for push notification testing)
EXPO_ACCESS_TOKEN=your_expo_access_token_here
```

> **Note:** The `ANTHROPIC_API_KEY` and `GROQ_API_KEY` are only required in the **backend** environment, not the mobile app itself. Never embed AI provider API keys in the mobile app bundle.

### 3. Backend environment

The backend has its own environment file:

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with the same ANTHROPIC_API_KEY, GROQ_API_KEY, DATABASE_URL, etc.
```

---

## Running the App Locally

### Start the Expo development server

```bash
npm start
```

This launches the Expo dev server and displays a QR code. You can then:

- **Scan the QR code** with the Expo Go app on your phone (iOS or Android)
- Press **`i`** to open in the iOS Simulator (macOS only, requires Xcode)
- Press **`a`** to open in the Android Emulator (requires Android Studio)
- Press **`w`** to open in a web browser (limited functionality)

### Using a development build

For features that require native modules (push notifications, secure store, etc.), use a development build instead of Expo Go:

```bash
# Build a development client for iOS Simulator
eas build --profile development --platform ios

# Build a development client for Android (APK)
eas build --profile development --platform android
```

Install the resulting build on your device/simulator, then run:

```bash
npm start
```

The development build will connect to your local Expo server automatically.

---

## Running the Backend

The backend is a Node.js/Express API server located in the `backend/` directory.

```bash
# Navigate to the backend directory
cd backend

# Start the development server (with hot reload via nodemon)
npm run dev
```

The server starts on `http://localhost:3000` by default.

### Useful backend scripts

```bash
npm run dev          # Start with hot reload (development)
npm start            # Start without hot reload (production-like)
npm test             # Run the test suite (Jest)
npm run lint         # Run ESLint
npm run db:migrate   # Run pending database migrations
npm run db:seed      # Seed the database with sample data
npm run db:reset     # Drop, recreate, and reseed the database
```

### Database setup (first time)

```bash
cd backend

# Create the database (requires PostgreSQL running locally)
npm run db:create

# Run all migrations
npm run db:migrate

# Seed with sample learning tracks and challenges
npm run db:seed
```

If you don't want to run PostgreSQL locally, you can use Docker:

```bash
docker run --name promptcraft-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=promptcraft_dev \
  -p 5432:5432 \
  -d postgres:16
```

Then set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/promptcraft_dev` in `backend/.env`.

---

## AI Provider Setup

PromptCraft Academy uses two AI providers for different purposes:

### Anthropic Claude

Claude handles the primary AI interactions — generating educational responses, evaluating prompt quality, and providing feedback on creative writing.

1. Create an account at [console.anthropic.com](https://console.anthropic.com/)
2. Generate an API key in the **API Keys** section
3. Add it to `backend/.env` as `ANTHROPIC_API_KEY`

**Models used:**
- `claude-3-5-haiku-20241022` — fast responses for real-time feedback
- `claude-3-5-sonnet-20241022` — higher-quality responses for complex creative tasks

**Usage note:** Claude API calls are made server-side only. The API key must never be included in the mobile app bundle.

### Groq

Groq is used for high-speed inference on lighter tasks such as content safety filtering and quick classification.

1. Create an account at [console.groq.com](https://console.groq.com/)
2. Generate an API key in the **API Keys** section
3. Add it to `backend/.env` as `GROQ_API_KEY`

**Models used:**
- `llama-3.1-8b-instant` — ultra-fast content safety classification
- `mixtral-8x7b-32768` — batch processing and summarisation tasks

### Child Safety Filter

All AI responses pass through a content safety pipeline before reaching the user. The safety filter runs on Groq for speed and uses a custom-tuned system prompt. Do not modify `backend/src/services/safetyFilter.ts` without reviewing the child safety requirements in `docs/safety-requirements.md`.

---

## Building for App Stores

We use [EAS Build](https://docs.expo.dev/build/introduction/) (Expo Application Services) for production builds.

### Prerequisites

```bash
# Log in to your Expo account
eas login

# Verify project configuration
eas build:configure
```

### Preview builds (internal testing)

Preview builds are distributed internally via a link — useful for QA and stakeholder testing.

```bash
# Build for both platforms
eas build --profile preview --platform all

# Build for a single platform
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### Production builds

Production builds are submitted to the App Store and Google Play.

```bash
# Build for both platforms (recommended)
eas build --profile production --platform all

# Build and submit to App Store (requires Apple credentials configured)
eas build --profile production --platform ios && eas submit --platform ios

# Build and submit to Google Play (requires service account key configured)
eas build --profile production --platform android && eas submit --platform android
```

Production builds use `autoIncrement: true`, so the `buildNumber` (iOS) and `versionCode` (Android) are incremented automatically on each build.

### Updating `version` in app.json

The `version` field (shown to users in the store) must be updated manually before a new release:

```bash
# Edit app.json and increment the version field
# e.g., "version": "1.0.0" → "version": "1.1.0"
```

Follow [Semantic Versioning](https://semver.org/):
- **PATCH** (1.0.x) — bug fixes, no new features
- **MINOR** (1.x.0) — new features, backwards compatible
- **MAJOR** (x.0.0) — breaking changes or major releases

### Over-the-air (OTA) updates

For small JS/asset changes that don't require a new native build, use EAS Update:

```bash
eas update --branch production --message "Fix typo in creative writing track"
```

OTA updates are delivered silently to users on next app launch.

---

## Project Structure

```
promptcraft-academy/
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build configuration
├── index.ts                  # App entry point
├── App.tsx                   # Root component
├── tsconfig.json             # TypeScript configuration
├── assets/
│   ├── icon.png              # App icon
│   ├── splash-icon.png       # Splash screen image
│   ├── android-icon-*.png    # Adaptive icon layers
│   └── store/                # App Store / Google Play assets
│       ├── ios-metadata.json
│       ├── android-metadata.json
│       ├── privacy-policy.md
│       ├── app-store-description.txt
│       └── google-play-description.txt
├── src/
│   ├── components/           # Reusable UI components
│   ├── screens/              # Screen components (one per route)
│   ├── navigation/           # React Navigation configuration
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API calls and external integrations
│   ├── store/                # State management (Zustand)
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Shared utility functions
└── backend/
    ├── src/
    │   ├── routes/           # Express route handlers
    │   ├── services/         # Business logic
    │   ├── models/           # Database models
    │   ├── middleware/        # Auth, safety filter, rate limiting
    │   └── utils/            # Backend utilities
    ├── migrations/           # Database migration files
    └── seeds/                # Database seed data
```

---

## Code Style and Standards

- **TypeScript** is required for all new files. Avoid `any` types.
- **ESLint** is configured with the project's ruleset. Run `npm run lint` before committing.
- **Prettier** is used for formatting. Most editors will format on save if configured.
- **Naming conventions:**
  - Components: `PascalCase` (e.g., `ChallengeCard.tsx`)
  - Hooks: `camelCase` prefixed with `use` (e.g., `useProgress.ts`)
  - Utilities: `camelCase` (e.g., `formatDate.ts`)
  - Constants: `SCREAMING_SNAKE_CASE`
- **Child safety:** Any code that touches AI prompts, responses, or user-generated content must pass through the safety filter. Never bypass `safetyFilter.ts` for any user-facing output.
- **Accessibility:** All interactive components must have appropriate `accessibilityLabel` and `accessibilityRole` props. Target WCAG 2.1 AA.

---

## Submitting a Pull Request

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**, following the code style guidelines above.

3. **Write tests** for new functionality. Run the test suite:
   ```bash
   npm test
   cd backend && npm test
   ```

4. **Run the linter** and fix any issues:
   ```bash
   npm run lint
   ```

5. **Commit your changes** with a clear, descriptive message:
   ```bash
   git commit -m "Add offline mode indicator to track progress screen"
   ```

6. **Push** to your fork and open a Pull Request against `main`.

7. **Fill in the PR template** — describe what changed, why, and how to test it.

8. A maintainer will review your PR. Please be patient and respond to feedback promptly.

### Pull Request checklist

- [ ] My code follows the project's TypeScript and ESLint standards
- [ ] I have tested my changes on both iOS and Android (or noted why platform-specific testing isn't needed)
- [ ] New features that involve AI output pass through the safety filter
- [ ] New user-facing text uses the i18n system (`t()` calls), not hardcoded strings
- [ ] I have not committed any `.env` files, API keys, or secrets
- [ ] I have updated relevant documentation if my changes affect setup or configuration

---

Thank you for helping make PromptCraft Academy better for kids everywhere.

For questions, reach out via GitHub Issues or email us at dev@promptcraft.academy.
