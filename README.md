# Meeting AI: Background Audio Recorder & Transcriber

Welcome to **Meeting AI**, a seamless mobile solution designed for professionals who need to stay present during meetings without worrying about note-taking. This app captures every word in the background and delivers high-quality AI insights directly to your pocket.

---

## 📱 Project Overview
The goal of this application is to record in-person meetings effortlessly. Whether your phone is in your pocket or the screen is locked, the app continues to capture audio. Once finished, our backend processes the audio into a transcript and summary, notifying you the moment it's ready.

### Core Features
* **One-Tap Recording:** Start capturing audio instantly.
* **Background Persistence:** Robust recording even when the app is backgrounded or the screen is locked.
* **Automated Processing:** High-speed audio upload and AI-driven transcription/summarization.
* **Smart Notifications:** Push notifications with deep-linking capabilities to take you directly to your meeting notes.

---

## 🏗️ System Architecture



### Frontend (React Native / Expo)
The mobile application uses **Expo Router** for file-based navigation:
* `app/tabs/index.tsx`: The **Home** screen dashboard.
* `app/tabs/meeting.tsx`: The **Meeting List** view.
* `app/meeting/[id].tsx`: The **Meeting Detail** view, accessed via deep links.

**Project Structure:**
* `plugins/`: Contains Expo config plugins for custom workflows (no `eject` required).
* `src/constants/`: Storage for static global variables.
* `src/hooks/`: Custom React hooks to encapsulate reusable logic (e.g., recording state).
* `src/lib/helper/`: Pure utility functions and business logic.
* `src/services/`: API fetching logic and communication with the Python backend.
* `src/types/`: Centralized TypeScript interfaces and type definitions.

### Backend (Python)
* `routes/`: API endpoints for audio uploads and data retrieval.
* `worker/`: An asynchronous worker specialized in processing audio via **OpenAI APIs** for transcription and summarization.

---

## 🚀 How to Run Locally

### Prerequisites
* **Source:** Clone the repository from the `main` branch.
* **Accounts:** You must have an **Expo Account** and a paid **Apple Developer Account** (for development builds).
* **Environment:**
    * **Node.js:** v20
    * **Java:** v17 (Required for Android builds)

### 1. Configuration & Security
To enable notifications and cloud features, place the following files in the specified directories:

* **Backend:** Create a `.env` file in the `/backend` root.
* **Android:** Place `google-services.json` in the app root to enable device token retrieval.
* **Notifications:** Place `fcm-service-account.json` in the backend to authorize Firebase Cloud Messaging (FCM) requests.

### 2. Frontend Development Build
Instead of a standard Expo Go app, we use a **Development Client** to support background recording and custom plugins.

1.  Run the build command:
    ```bash
    npm run eas:build:dev
    ```
2.  Once the build is finished, download the **APK** (Android) or **IPA** (iOS) from the Expo Dashboard.
3.  Install the file on your device.
4.  Start the local bundler:
    ```bash
    npx expo start --dev-client -c
    ```
5.  Scan the QR code using your phone. This enables **Hot Reloading** over Wi-Fi without needing a USB cable.

### 3. Backend Execution
To start the Python server, run:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
