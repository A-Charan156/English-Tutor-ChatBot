# 🎓 Virtual English Tutor (3D Chatbot)

A real-time, interactive 3D virtual English tutor application. This project features a React Three Fiber-based frontend for rendering a 3D avatar and a Node.js backend integrating the Groq API (LLaMA 3.3) for advanced natural language processing. It includes dynamic lip-syncing for highly realistic and engaging interactions.

Developed as part of a Hackathon project demonstrating **Principles of Software Project Management**, this repository showcases structured development, clear architectural separation, and modern web technologies.

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Software Project Management Principles](#-software-project-management-principles)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [Usage](#-usage)
- [Future Scope](#-future-scope)

---

## 🎯 Project Overview
The Virtual English Tutor is designed to help users practice their English grammar, vocabulary, and pronunciation in a conversational setting. By utilizing a 3D avatar that responds in real-time with synchronized lip movements and AI-generated text, it provides an immersive educational experience.

## ✨ Key Features
- **3D Avatar Interface**: Built with React Three Fiber (`@react-three/fiber`) and Drei for a responsive and engaging user interface.
- **Advanced NLP**: Leverages the **Groq API** (running `llama-3.3-70b-versatile`) to generate intelligent, context-aware responses tailored specifically to English tutoring.
- **Real-time Lip Sync**: Custom backend algorithm maps phonemes to specific mouth cues dynamically, bringing the avatar to life without pre-rendered animations.
- **Browser TTS Integration**: Utilizes built-in browser Text-to-Speech capabilities for low-latency audio responses.
- **Robust Fallback Mechanism**: Ensures continuous conversation even if the external LLM API encounters rate limits or errors.

---

## 🏗 Architecture & Tech Stack

The project follows a decoupled **Client-Server Architecture**:

### Frontend
- **Framework**: React.js
- **3D Rendering**: Three.js, React Three Fiber, `@react-three/drei`
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

### Backend
- **Environment**: Node.js
- **Framework**: Express.js
- **AI Integration**: Groq API (LLaMA 3.3)
- **Utilities**: CORS, dotenv, node-fetch

---

## 📊 Software Project Management Principles
This project was executed adhering to core Software Project Management (SPM) principles:

1. **Scope Management**: Clearly defined the objective—an English tutoring chatbot—and restricted the LLM prompt to only answer queries related to the English subject.
2. **Modular Design**: Separated concerns into independent `frontend` and `backend` repositories/folders, allowing parallel development and easier maintenance.
3. **Risk Management**: Implemented fallback responses and robust error handling in the backend to mitigate the risk of third-party API failures.
4. **Iterative Development**: Started with a base 3D model and simple text responses, iteratively adding LLM integration and finally dynamic lip-syncing.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [Yarn](https://yarnpkg.com/) or npm
- A [Groq API Key](https://console.groq.com/)

### Installation & Setup

1. **Clone the repository** (or extract the project folder):
   ```bash
   git clone <repository-url>
   cd ChatbotHackathon
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   yarn install
   ```
   Create a `.env` file in the `backend` directory and add your Groq API key:
   ```env
   PORT=3000
   GROQ_API_KEY=your_groq_api_key_here
   ```
   Start the backend server:
   ```bash
   yarn dev
   # The backend will run on http://localhost:3000
   ```

3. **Frontend Setup**:
   Open a new terminal window:
   ```bash
   cd frontend
   yarn install
   ```
   Start the frontend development server:
   ```bash
   yarn dev
   # The frontend will typically run on http://localhost:5173
   ```

---

## 💻 Usage
1. Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
2. The 3D avatar will load and greet you.
3. Type your English-related questions in the chat interface.
4. The avatar will respond with synchronized lip movements and synthesized speech. Say "bye" to gracefully close the conversation.

---

## 🔮 Future Scope
- **Voice Recognition**: Integrate Web Speech API to allow users to speak directly to the tutor instead of typing.
- **User Authentication**: Allow users to create accounts and track their learning progress over time.
- **Advanced Animations**: Add more sophisticated body language and facial expressions based on the sentiment of the conversation.

---
