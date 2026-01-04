<div align="center">
  <img src="./assets/images/logo-mic.jpg" alt="Siora Logo" width="120" height="120" style="border-radius: 20px;">
  
  # Siora
  
  **Your Personal AI-Powered Mindfulness Companion**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LiveKit](https://img.shields.io/badge/LiveKit-3B82F6?style=for-the-badge&logo=webrtc&logoColor=white)](https://livekit.io/)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-project-structure">Structure</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

---

## 📝 Description

**Siora** is a cutting-edge, cross-platform mobile application designed to bring mindfulness and inner peace through AI-driven voice conversations and structured meditation courses. Built with **React Native** and **Expo**, it leverages **LiveKit** and **ElevenLabs** to create immersive, real-time audio experiences.

Whether you're exploring guided meditation courses like "Sleep Journey" or "Anxiety Release", practicing with curated library sessions, or engaging in AI-powered mindfulness conversations, Siora adapts to your wellness needs. With secure authentication via **Clerk** and robust data management using **Firebase**, your wellness journey is private, secure, and seamless.

## 📱 App Screens

### 🏠 Home Dashboard

Browse curated meditation sessions with beautiful parallax scrolling effects. Each session features:

- Stunning background imagery
- Session descriptions and themes
- Quick access to start your practice

### 📚 Library

Access quick meditation sessions with customizable options:

- **Morning Focus** (3 min) - Start your day with clarity
- **Deep Relax** (5 min) - Take a mindful break
- **Anxiety Relief** (4 min) - Find calm in chaos
- **Sleep Well** (10 min) - Drift into peaceful sleep
- Optional background audio for enhanced experience
- Community group meditation sessions

### 🎓 Courses

Structured multi-day meditation programs with progressive learning:

- **Course Detail Screen**: Beautiful slide-to-start gesture, course overview, syllabus preview
- **Video Lectures**: Premium iOS-style video player with custom controls
- **Progressive Unlocking**: Complete lessons to unlock the next
- Track your progress through each course

### 🧘 AI Sessions

Real-time voice conversations with AI meditation guide:

- Live audio streaming with LiveKit
- Natural voice synthesis with ElevenLabs
- Session summaries and insights
- Token-based wisdom collection

### 📊 Profile & Progress

Track your mindfulness journey:

- Session history with detailed analytics
- Streak tracking and achievements
- Personal statistics and milestones
- Profile customization

## ✨ Features

- **🎓 Structured Courses**: Multi-day meditation courses with video lectures and progressive unlocking
  - Sleep Journey (7 days)
  - Anxiety Release (10 days)
  - Focus Flow (14 days)
- **📚 Meditation Library**: Quick meditation sessions with optional background audio
  - Morning Focus, Deep Relax, Anxiety Relief, Sleep Well
  - Customizable audio preferences
- **🤖 AI Voice Conversations**: Real-time, low-latency voice interactions powered by LiveKit and ElevenLabs
- **🧘‍♀️ Curated Sessions**: Choose from various themes like _Forest Serenity_, _Mountain Stillness_, _Ocean Rhythms_, and more
- **🎥 Video Lectures**: Premium iOS-style video player with custom controls and lesson navigation
- **🫁 Breathing Exercises**: Interactive breathing exercises with visual guidance and haptic feedback
- **📊 Progress Tracking**: View your session history, streaks, and achievements
- **🔐 Secure Authentication**: Seamless sign-up and sign-in flows using Clerk (Email, Google, Apple)
- **🎨 Modern UI/UX**:
  - **iOS-Inspired Design**: Inset grouped lists, glassmorphism, and premium aesthetics
  - **Parallax Scrolling**: Beautiful visual effects using `react-native-reanimated`
  - **Smooth Animations**: Powered by Reanimated and Skia
  - **Slide-to-Start**: Intuitive gesture-based course initiation
- **📱 Cross-Platform**: Optimized for both iOS and Android
- **👥 Community Features**: Group meditation sessions and social engagement

## 🛠️ Tech Stack

| Category        | Technology                       | Description                          |
| :-------------- | :------------------------------- | :----------------------------------- |
| **Framework**   | React Native (Expo)              | Cross-platform mobile development    |
| **Language**    | TypeScript                       | Type-safe code                       |
| **Routing**     | Expo Router                      | File-based routing                   |
| **Voice/Video** | LiveKit, ElevenLabs              | Real-time audio & AI voice synthesis |
| **Video**       | Expo Video                       | Native video playback                |
| **Auth**        | Clerk                            | User authentication & management     |
| **Backend**     | Firebase                         | Database & backend services          |
| **Styling**     | StyleSheet, Expo Linear Gradient | Native styling & gradients           |
| **Animations**  | Reanimated, Skia                 | High-performance animations          |
| **Lists**       | FlashList                        | Fast & efficient list rendering      |

## 📦 Key Dependencies

| Package                                                                                 | Version    | Description                                                   |
| :-------------------------------------------------------------------------------------- | :--------- | :------------------------------------------------------------ |
| [`@clerk/clerk-expo`](https://clerk.com/docs/quickstarts/expo)                          | `^2.19.4`  | **Authentication**: Secure user management and sign-in flows. |
| [`@elevenlabs/react-native`](https://elevenlabs.io/docs/api-reference/react-native-sdk) | `^0.5.2`   | **AI Voice**: Realistic text-to-speech synthesis.             |
| [`@livekit/react-native`](https://docs.livekit.io/client-sdk-react-native/)             | `^2.9.5`   | **Real-time**: Low-latency voice and video communication.     |
| [`firebase`](https://firebase.google.com/docs/web/setup)                                | `^12.7.0`  | **Backend**: Database and cloud services.                     |
| [`expo-video`](https://docs.expo.dev/versions/latest/sdk/video/)                        | `~3.0.15`  | **Video**: Native video playback for course lectures.         |
| [`expo-audio`](https://docs.expo.dev/versions/latest/sdk/audio/)                        | `^1.1.1`   | **Audio**: Audio playback for meditation sessions.            |
| [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/)        | `~4.1.1`   | **Animations**: High-performance, declarative animations.     |
| [`expo`](https://docs.expo.dev/)                                                        | `~54.0.25` | **Framework**: The core platform for building universal apps. |

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (LTS version recommended)
- **npm** or **yarn**
- **Expo Go** app on your phone OR Android Studio / Xcode for emulators.

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/PrashantJaybhaye/AI-Agent.git
    cd AI-Agent
    # Note: The project folder is named 'siora' locally
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your keys:

    ```env
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    EXPO_PUBLIC_FIREBASE_API_KEY=...
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    EXPO_PUBLIC_FIREBASE_APP_ID=...
    # Add LiveKit and ElevenLabs keys if required by your implementation
    ```

4.  **Run the app**
    ```bash
    npx expo start
    ```

## 🏃‍♂️ Run Commands

| Command                 | Description                        |
| :---------------------- | :--------------------------------- |
| `npm run start`         | Start the Expo development server  |
| `npm run android`       | Run on Android emulator/device     |
| `npm run ios`           | Run on iOS simulator/device        |
| `npm run web`           | Run on web browser                 |
| `npm run reset-project` | Reset the project to a clean state |
| `npm run lint`          | Run ESLint to check code quality   |

## 📁 Project Structure

```
siora/
├── app/
│   ├── (protected)/     # Authenticated routes
│   │   ├── (tabs)/      # Tab navigation
│   │   │   ├── index.tsx       # Home dashboard
│   │   │   ├── library.tsx     # Meditation library
│   │   │   ├── profile.tsx     # User profile
│   │   │   └── history.tsx     # Session history
│   │   ├── course/      # Course-related screens
│   │   │   ├── [id].tsx        # Course detail
│   │   │   └── lecture.tsx     # Video lecture player
│   │   ├── session/     # Session screens
│   │   │   ├── [id].tsx        # Active session
│   │   │   └── summary.tsx     # Session summary
│   │   ├── admin/       # Admin panel
│   │   ├── meditate.tsx # Breathing exercise screen
│   │   └── edit-profile.tsx
│   ├── (public)/        # Public routes
│   │   ├── index.tsx    # Landing page
│   │   └── sign-up.tsx  # Registration
│   ├── api/             # API route handlers
│   └── _layout.tsx      # Root layout configuration
├── components/
│   ├── screens/         # Screen-level components
│   │   ├── CourseDetailScreen.tsx    # Course detail UI
│   │   ├── CourseLectureScreen.tsx   # Video lecture UI
│   │   ├── SessionScreen.tsx         # AI session UI
│   │   └── SummaryScreen.tsx         # Session summary UI
│   ├── lecture/         # Lecture components
│   │   └── LectureVideoControls.tsx  # Custom video controls
│   ├── clerk/           # Authentication components
│   ├── admin/           # Admin components
│   ├── ui/              # Reusable UI components
│   ├── BreathingExercise.tsx
│   ├── ParallaxScrollView.tsx
│   └── CustomTabBar.tsx
├── hooks/
│   ├── useConversation.tsx        # LiveKit/ElevenLabs integration
│   └── useConversation.native.ts  # Native implementation
├── context/
│   └── UserContext.tsx  # User state management
├── utils/
│   ├── firebase.ts      # Firebase SDK configuration
│   ├── sessions.ts      # Session & course data
│   ├── types.ts         # TypeScript interfaces
│   ├── colors.ts        # Design system colors
│   ├── achievements.ts  # Achievement logic
│   └── streak.ts        # Streak tracking
├── assets/
│   ├── images/          # App icons and logos
│   └── sessions/        # Session background images
└── ...config files
```

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable                                   | Description                          | Required |
| :----------------------------------------- | :----------------------------------- | :------- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`        | Your Clerk Publishable Key           | Yes      |
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | Firebase API Key                     | Yes      |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase Auth Domain                 | Yes      |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase Project ID                  | Yes      |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase Storage Bucket              | Yes      |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID         | Yes      |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | Firebase App ID                      | Yes      |
| `EXPO_PUBLIC_LIVEKIT_URL`                  | LiveKit Server URL (if using custom) | No       |
| `EXPO_PUBLIC_LIVEKIT_TOKEN`                | LiveKit Token (for testing)          | No       |

## 🚧 Roadmap

- [x] **Core**: Voice conversations with AI
- [x] **Auth**: Secure login with Clerk
- [x] **UI**: Modern, animated interface with iOS-inspired design
- [x] **Courses**: Multi-day structured meditation courses
- [x] **Video**: Custom video player for course lectures
- [x] **Library**: Quick meditation sessions with audio
- [x] **Breathing**: Interactive breathing exercises
- [x] **Progress**: Session history and streak tracking
- [ ] **Achievements**: Expanded achievement system with badges
- [ ] **Offline Mode**: Download courses for offline access
- [ ] **Social**: Share progress with friends
- [ ] **Customization**: Personalized themes and voice options
- [ ] **Analytics**: Advanced insights into meditation patterns

## ❓ Troubleshooting

**Issue: Metro Bundler not starting?**

> Try running `npx expo start -c` to clear the cache.

**Issue: Audio not working on Android?**

> Ensure you have granted microphone permissions. Check `app.json` for `android.permissions`.

**Issue: "Clerk: Missing Publishable Key"?**

> Verify your `.env` file is correctly named and located in the root. Restart the server after changing `.env`.

## 🤝 Contributing

Contributions are always welcome!

1.  **Fork** the repository.
2.  **Clone** your fork.
3.  **Create** a new branch (`git checkout -b feature/amazing-feature`).
4.  **Commit** your changes (`git commit -m 'Add some amazing feature'`).
5.  **Push** to the branch (`git push origin feature/amazing-feature`).
6.  **Open** a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made by <a href="https://github.com/PrashantJaybhaye">Prashant Jaybhaye</a>
</div>
