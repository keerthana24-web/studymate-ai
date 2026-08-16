# 📚 StudyMate AI

> An AI-powered study assistant that transforms any topic or study notes into an interactive learning set with summaries, flashcards, and quizzes.

## 🌐 Live Demo

**Frontend:** https://studymate-ai-eosin.vercel.app/

**Backend:** https://studymate-ai-x2ap.onrender.com/

> If the Vercel frontend URL is different, replace the frontend URL above with the exact URL shown in your Vercel dashboard.

---

## ✨ Features

* 🤖 **AI-Powered Study Material** — Generate learning content from any topic or notes.
* 📖 **Smart Summary** — Get a clear, beginner-friendly explanation of the topic.
* 🃏 **Interactive Flashcards** — Review five AI-generated question-and-answer flashcards.
* 📝 **AI Quiz** — Test your understanding with five multiple-choice questions.
* ✅ **Instant Feedback** — See whether each quiz answer is correct or incorrect.
* 📊 **Quiz Score** — Get your final score and accuracy after completing the quiz.
* 🔄 **Retake Quiz** — Practice the same topic again.
* ⏳ **Loading State** — Clearly shows when AI-generated content is being created.
* ⚠️ **Error Handling** — Displays useful messages when something goes wrong.

---

## 🧠 How It Works

```text
User enters a topic or notes
          ↓
React frontend sends the topic
          ↓
Express.js backend receives the request
          ↓
Gemini AI generates study material
          ↓
Zod validates the generated data
          ↓
Validated data is sent back to React
          ↓
Summary + Flashcards + Quiz are displayed
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* CORS
* dotenv

### AI & Validation

* Google Gemini API
* `@google/genai`
* Zod

### Deployment

* GitHub — source code and version control
* Vercel — frontend deployment
* Render — backend deployment

---

## 📂 Project Structure

```text
studymate-ai/
│
├── public/
│
├── server/
│   └── index.js
│
├── src/
│   ├── assets/
│   ├── App.css
│   ├── App.jsx
│   └── index.css
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/keerthana24-web/studymate-ai.git
cd studymate-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the Gemini API key

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

**Never commit your `.env` file or expose your API key publicly.**

### 4. Start the backend

```bash
node server/index.js
```

The backend runs on:

```text
http://localhost:5000
```

### 5. Start the frontend

Open another terminal:

```bash
npm run dev
```

The Vite development server will provide the local frontend URL.

---

## 🎯 Project Objective

The goal of StudyMate AI is to make studying more interactive and efficient by combining AI-generated explanations with active-recall techniques.

Instead of only reading notes, students can:

1. Understand the topic through a summary.
2. Review important concepts using flashcards.
3. Test their knowledge through a quiz.
4. Receive immediate feedback.
5. Retake the quiz for additional practice.

---

## 🔐 Security

The Gemini API key is stored as an environment variable and is used by the backend rather than being exposed directly in the frontend.

The `.env` file is excluded from Git using `.gitignore`.

---

## 🔮 Future Improvements

Possible future enhancements include:

* Difficulty selection for quizzes
* Study-set history
* More customizable quiz settings
* Progress tracking
* User accounts
* Personalized learning recommendations

---

## 👩‍💻 Author

**Keerthana M**

Computer Science Engineering Student

---

## 📄 License

This project was created as an academic/portfolio project.
