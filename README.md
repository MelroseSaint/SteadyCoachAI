# SteadyCoachAI

**Your personal, privacy-first AI interview coach.**

SteadyCoachAI is a sophisticated React application designed to help job seekers practice technical and behavioral interviews in a safe, realistic environment. It features both a traditional text-based chat interface and a cutting-edge real-time voice mode powered by Google's Gemini Live API.

![SteadyCoach Interface](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000)

## 🌟 Key Features

### 🧠 Intelligent Coaching Modes
*   **Structured Interview:** The AI takes the lead, asking questions sequentially to mimic a standard interview flow.
*   **Answer Refinement:** Paste your prepared answers, and the Coach critiques them based on the STAR method, clarity, and impact.
*   **Live Simulation:** A high-pressure mode with timed responses and stricter evaluation logic.

### 🎙️ Real-Time Voice Interview (Gemini Live)
*   **Low Latency:** Experience natural, interruptible conversations using the Gemini Multimodal Live API via WebSockets.
*   **Audio Visualization:** Real-time waveform visualization helps you see who is speaking and monitor audio levels.
*   **Speech-to-Text:** In text mode, use the built-in dictation feature to speak your answers instead of typing.

### 🔒 Privacy-First Architecture
*   **Client-Side Only:** No backend servers, no databases, and no user accounts.
*   **Local Storage:** All session history, settings, and API keys are stored exclusively in your browser's local storage.
*   **BYOK (Bring Your Own Key):** Supports Google Gemini, OpenAI, and Groq API keys directly from the client.

### 🎨 Modern UI/UX
*   **Responsive Design:** Works seamlessly on desktop and mobile.
*   **Dark/Light Mode:** Full theming support.
*   **Export & Print:** Save your interview transcripts as `.txt` files or print them to PDF for review.

## 🛠️ Tech Stack

*   **Framework:** React 19 (TypeScript)
*   **Styling:** Tailwind CSS
*   **AI Integration:** `@google/genai` SDK (Gemini 2.5/3.0 models)
*   **Icons:** Lucide React
*   **Markdown:** `react-markdown` for rich text rendering

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)
*   A Google Cloud Project with the **Gemini API** enabled (for Voice Mode).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/steadycoach-ai.git
    cd steadycoach-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm start
    ```

### Environment Variables (Optional)
You can bake a default API key into the build for internal use, though users can always override this in the UI settings.

Create a `.env` file in the root directory:
```env
API_KEY=your_google_genai_api_key
```

## 📖 Usage Guide

1.  **Setup:** Launch the app and select your target role (e.g., Frontend Engineer, Product Manager), experience level, and optional company context.
2.  **Choose Mode:**
    *   **Text Chat:** Standard chat interface. Perfect for refining answers and thoughtful practice.
    *   **Voice Live:** (Requires Gemini API Key) Real-time audio conversation. Best for practicing delivery and nerves.
3.  **Practice:** Engage with SteadyCoach.
    *   Use the **Microphone** icon in chat to dictate.
    *   Use the **Feedback** button in Voice mode to log thoughts on the session.
4.  **Review:** Export your chat history to review your answers later.

## 🔐 Security & Privacy

SteadyCoachAI is built with a "Local-Only" philosophy:
*   **No Data Collection:** The developer does not track usage or collect personal data.
*   **Direct Connections:** When using an API key, requests go directly from your browser to the AI provider (Google, OpenAI, etc.).
*   **Volatile Memory:** Clearing your browser cache removes all application data.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any features, bug fixes, or documentation improvements.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed by DarkStackStudiosInc*
