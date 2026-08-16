import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [topic, setTopic] = useState("");
  const [studyData, setStudyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------
  // STUDY HISTORY
  // --------------------------------

  const [studyHistory, setStudyHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem(
        "studymate-history"
      );

      return savedHistory
        ? JSON.parse(savedHistory)
        : [];
    } catch {
      return [];
    }
  });

  // Flashcard state
  const [flippedCards, setFlippedCards] = useState({});

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // --------------------------------
  // SAVE HISTORY
  // --------------------------------

  useEffect(() => {
    localStorage.setItem(
      "studymate-history",
      JSON.stringify(studyHistory)
    );
  }, [studyHistory]);

  // --------------------------------
  // RESET QUIZ
  // --------------------------------

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setQuizScore(0);
    setQuizSubmitted(false);
    setQuizFinished(false);
  };

  // --------------------------------
  // FLASHCARD
  // --------------------------------

  const toggleFlashcard = (index) => {
    setFlippedCards((previous) => ({
      ...previous,
      [index]: !previous[index],
    }));
  };

  // --------------------------------
  // QUIZ - SELECT ANSWER
  // --------------------------------

  const handleAnswerSelect = (answer) => {
    if (!quizSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  // --------------------------------
  // QUIZ - SUBMIT ANSWER
  // --------------------------------

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !studyData?.quiz) return;

    const question = studyData.quiz[currentQuestion];

    if (selectedAnswer === question.answer) {
      setQuizScore((previous) => previous + 1);
    }

    setQuizSubmitted(true);
  };

  // --------------------------------
  // QUIZ - NEXT QUESTION
  // --------------------------------

  const handleNextQuestion = () => {
    if (!studyData?.quiz) return;

    if (currentQuestion < studyData.quiz.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      setSelectedAnswer("");
      setQuizSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  // --------------------------------
  // QUIZ - RETAKE
  // --------------------------------

  const handleRetryQuiz = () => {
    resetQuiz();
  };

  // --------------------------------
  // LOAD HISTORY ITEM
  // --------------------------------

  const handleLoadHistory = (item) => {
    setStudyData(item.studyData);
    setTopic(item.topic);
    setError("");

    setFlippedCards({});
    resetQuiz();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // --------------------------------
  // DELETE HISTORY ITEM
  // --------------------------------

  const handleDeleteHistory = (id) => {
    setStudyHistory((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  // --------------------------------
  // CLEAR ALL HISTORY
  // --------------------------------

  const handleClearHistory = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all study history?"
    );

    if (confirmed) {
      setStudyHistory([]);
    }
  };

  // --------------------------------
  // GENERATE STUDY MATERIAL
  // --------------------------------

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setStudyData(null);

    setFlippedCards({});
    resetQuiz();

    try {
      const response = await fetch(
        "http://localhost:5000/api/study",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            topic: topic.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to generate study material"
        );
      }

      setStudyData(data);

      // --------------------------------
      // ADD TO HISTORY
      // --------------------------------

      const historyItem = {
        id: Date.now(),
        topic: topic.trim(),
        title: data.title,
        studyData: data,
        createdAt: new Date().toLocaleString(),
      };

      setStudyHistory((previous) => [
        historyItem,
        ...previous,
      ]);
    } catch (error) {
      console.error("Frontend error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // QUIZ PROGRESS
  // --------------------------------

  const totalQuestions =
    studyData?.quiz?.length || 0;

  const answeredQuestions =
    currentQuestion +
    (quizSubmitted ? 1 : 0);

  const progressPercentage =
    totalQuestions > 0
      ? (answeredQuestions / totalQuestions) * 100
      : 0;

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================== */}

      <header className="header">

        <div className="logo">
          <span className="logo-icon">
            ✦
          </span>

          <span>
            StudyMate AI
          </span>
        </div>

        <span className="badge">
          AI Study Assistant
        </span>

      </header>


      {/* =========================
          MAIN
      ========================== */}

      <main className="main">

        <section className="hero">

          <div className="hero-icon">
            ✦
          </div>

          <p className="eyebrow">
            LEARN SMARTER
          </p>

          <h1>
            Turn your notes into
            <span>
              {" "}a study set.
            </span>
          </h1>

          <p className="subtitle">
            Paste your notes or enter any topic.
            AI will create interactive flashcards
            and a quiz to help you learn.
          </p>


          {/* =========================
              INPUT
          ========================== */}

          <div className="input-card">

            <label htmlFor="topic">
              What do you want to study?
            </label>

            <textarea
              id="topic"
              value={topic}
              onChange={(event) =>
                setTopic(event.target.value)
              }
              placeholder="Example: Explain photosynthesis, including the light-dependent reactions, Calvin cycle, and factors affecting the rate..."
              rows="7"
            />

            <div className="input-footer">

              <span>
                {topic.length} characters
              </span>

              <button
                onClick={handleGenerate}
                disabled={
                  !topic.trim() || loading
                }
              >
                {loading
                  ? "Generating..."
                  : "Generate Study Set"}

                <span>
                  →
                </span>
              </button>

            </div>

            {loading && (
              <div className="loading-state">

                <span className="loading-spinner"></span>

                Creating your study set...

              </div>
            )}

          </div>


          {/* =========================
              ERROR
          ========================== */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}


          {/* =========================
              STUDY HISTORY
          ========================== */}

          {studyHistory.length > 0 && (

            <section className="history-section">

              <div className="history-header">

                <div>
                  <p className="history-eyebrow">
                    YOUR LIBRARY
                  </p>

                  <h2>
                    Recent Study Sets
                  </h2>
                </div>

                <button
                  className="clear-history-button"
                  onClick={handleClearHistory}
                >
                  Clear History
                </button>

              </div>


              <div className="history-grid">

                {studyHistory.map((item) => (

                  <div
                    className="history-card"
                    key={item.id}
                  >

                    <button
                      className="history-main"
                      onClick={() =>
                        handleLoadHistory(item)
                      }
                    >

                      <span className="history-icon">
                        📚
                      </span>

                      <div className="history-content">

                        <strong>
                          {item.title}
                        </strong>

                        <span>
                          {item.topic.length > 75
                            ? `${item.topic.slice(
                                0,
                                75
                              )}...`
                            : item.topic}
                        </span>

                        <small>
                          {item.createdAt}
                        </small>

                      </div>

                      <span className="history-arrow">
                        →
                      </span>

                    </button>


                    <button
                      className="delete-history-button"
                      onClick={() =>
                        handleDeleteHistory(
                          item.id
                        )
                      }
                      title="Delete study set"
                    >
                      ×
                    </button>

                  </div>

                ))}

              </div>

            </section>

          )}


          {/* =========================
              RESULTS
          ========================== */}

          {studyData && (

            <section className="study-results">

              <h2>
                {studyData.title}
              </h2>


              {/* =========================
                  SUMMARY
              ========================== */}

              <div className="result-card">

                <h3>
                  📚 Summary
                </h3>

                <p>
                  {studyData.summary}
                </p>

              </div>


              {/* =========================
                  FLASHCARDS
              ========================== */}

              <div className="result-card">

                <h3>
                  🃏 Flashcards
                </h3>

                <p className="flashcard-hint">
                  Click a card to reveal the answer.
                </p>

                <div className="flashcards-grid">

                  {studyData.flashcards?.map(
                    (card, index) => (

                      <button
                        className={`flashcard ${
                          flippedCards[index]
                            ? "flipped"
                            : ""
                        }`}
                        key={index}
                        onClick={() =>
                          toggleFlashcard(index)
                        }
                      >

                        {!flippedCards[index] ? (

                          <>
                            <span className="flashcard-number">
                              Card {index + 1}
                            </span>

                            <strong>
                              {card.question}
                            </strong>

                            <span className="flashcard-action">
                              Click to reveal →
                            </span>
                          </>

                        ) : (

                          <>
                            <span className="flashcard-number">
                              Answer
                            </span>

                            <p>
                              {card.answer}
                            </p>

                            <span className="flashcard-action">
                              ↻ Click to flip back
                            </span>
                          </>

                        )}

                      </button>

                    )
                  )}

                </div>

              </div>


              {/* =========================
                  QUIZ
              ========================== */}

              <div className="result-card quiz-card">

                <h3>
                  📝 Quiz
                </h3>


                {!quizFinished ? (

                  <>

                    {/* QUIZ PROGRESS */}

                    <div className="quiz-progress-header">

                      <div className="quiz-progress-text">

                        <span>
                          Question{" "}
                          {currentQuestion + 1}{" "}
                          of{" "}
                          {totalQuestions}
                        </span>

                        <span className="quiz-percentage">
                          {Math.round(
                            progressPercentage
                          )}
                          %
                        </span>

                      </div>

                      <div className="quiz-progress-track">

                        <div
                          className="quiz-progress-fill"
                          style={{
                            width: `${progressPercentage}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* QUESTION */}

                    <div className="quiz-question">

                      <strong>
                        {currentQuestion + 1}.{" "}
                        {
                          studyData.quiz[
                            currentQuestion
                          ].question
                        }
                      </strong>


                      {/* OPTIONS */}

                      <div className="quiz-options">

                        {studyData.quiz[
                          currentQuestion
                        ].options.map(
                          (option, index) => (

                            <button
                              key={index}
                              className={`quiz-option ${
                                selectedAnswer ===
                                option
                                  ? "selected"
                                  : ""
                              } ${
                                quizSubmitted &&
                                option ===
                                  studyData.quiz[
                                    currentQuestion
                                  ].answer
                                  ? "correct"
                                  : ""
                              } ${
                                quizSubmitted &&
                                selectedAnswer ===
                                  option &&
                                option !==
                                  studyData.quiz[
                                    currentQuestion
                                  ].answer
                                  ? "incorrect"
                                  : ""
                              }`}
                              onClick={() =>
                                handleAnswerSelect(
                                  option
                                )
                              }
                              disabled={
                                quizSubmitted
                              }
                            >

                              <span className="option-icon">

                                {quizSubmitted &&
                                option ===
                                  studyData.quiz[
                                    currentQuestion
                                  ].answer
                                  ? "✓"
                                  : quizSubmitted &&
                                    selectedAnswer ===
                                      option
                                  ? "×"
                                  : String.fromCharCode(
                                      65 + index
                                    )}

                              </span>

                              <span>
                                {option}
                              </span>

                            </button>

                          )
                        )}

                      </div>


                      {/* FEEDBACK */}

                      {quizSubmitted && (

                        <div
                          className={
                            selectedAnswer ===
                            studyData.quiz[
                              currentQuestion
                            ].answer
                              ? "quiz-feedback correct-feedback"
                              : "quiz-feedback incorrect-feedback"
                          }
                        >

                          {selectedAnswer ===
                          studyData.quiz[
                            currentQuestion
                          ].answer

                            ? "✓ Correct! Great job!"

                            : `× Incorrect. Correct answer: ${
                                studyData.quiz[
                                  currentQuestion
                                ].answer
                              }`}

                        </div>

                      )}


                      {/* QUIZ BUTTON */}

                      {!quizSubmitted ? (

                        <button
                          className="quiz-button"
                          onClick={
                            handleSubmitAnswer
                          }
                          disabled={
                            !selectedAnswer
                          }
                        >
                          Submit Answer
                        </button>

                      ) : (

                        <button
                          className="quiz-button"
                          onClick={
                            handleNextQuestion
                          }
                        >

                          {currentQuestion <
                          studyData.quiz.length - 1
                            ? "Next Question →"
                            : "Finish Quiz"}

                        </button>

                      )}

                    </div>

                  </>

                ) : (

                  /* =========================
                     QUIZ COMPLETED
                  ========================== */

                  <div className="quiz-result">

                    <div className="quiz-result-check">
                      ✓
                    </div>

                    <p className="quiz-completed">
                      QUIZ COMPLETED
                    </p>

                    <h4>

                      {quizScore ===
                      studyData.quiz.length

                        ? "Mastered!"

                        : quizScore >= 4

                        ? "Almost Mastered!"

                        : quizScore >= 3

                        ? "Good Progress!"

                        : "Keep Practicing!"}

                    </h4>

                    <p className="quiz-description">

                      {quizScore ===
                      studyData.quiz.length

                        ? "You've got an excellent understanding of this topic."

                        : quizScore >= 4

                        ? "You're very close to mastering this topic."

                        : quizScore >= 3

                        ? "You've made a good start. Keep practicing!"

                        : "Don't worry. Practice makes perfect!"}

                    </p>


                    {/* SCORE */}

                    <div className="quiz-score">

                      <span className="score-number">
                        {quizScore}
                      </span>

                      <span className="score-divider">
                        /
                      </span>

                      <span className="score-total">
                        {studyData.quiz.length}
                      </span>

                    </div>

                    <p className="questions-correct">
                      QUESTIONS CORRECT
                    </p>


                    {/* STATS */}

                    <div className="quiz-stats">

                      <div className="quiz-stat">

                        <div className="stat-icon">
                          ✓
                        </div>

                        <strong>

                          {Math.round(
                            (quizScore /
                              studyData.quiz
                                .length) *
                              100
                          )}
                          %

                        </strong>

                        <span>
                          Accuracy
                        </span>

                      </div>


                      <div className="quiz-stat">

                        <div className="stat-icon">
                          ⚡
                        </div>

                        <strong>

                          {quizScore ===
                          studyData.quiz.length

                            ? "Perfect"

                            : quizScore >= 4

                            ? "Great"

                            : quizScore >= 3

                            ? "Good"

                            : "Practice"}

                        </strong>

                        <span>
                          Performance
                        </span>

                      </div>

                    </div>


                    {/* RETAKE */}

                    <button
                      className="quiz-retake-button"
                      onClick={
                        handleRetryQuiz
                      }
                    >
                      ↻ Retake Quiz
                    </button>

                  </div>

                )}

              </div>

            </section>

          )}


          {/* =========================
              FEATURES
          ========================== */}

          <div className="features">

            <div className="feature">

              <span>
                ✦
              </span>

              <div>

                <strong>
                  Flashcards
                </strong>

                <p>
                  Learn with active recall
                </p>

              </div>

            </div>


            <div className="feature">

              <span>
                ✓
              </span>

              <div>

                <strong>
                  Quiz
                </strong>

                <p>
                  Test what you know
                </p>

              </div>

            </div>


            <div className="feature">

              <span>
                ↻
              </span>

              <div>

                <strong>
                  Retry
                </strong>

                <p>
                  Practice your mistakes
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>


      {/* =========================
          FOOTER
      ========================== */}

      <footer>

        <span>
          StudyMate AI
        </span>

        <span>
          Built with React + AI
        </span>

      </footer>

    </div>
  );
}

export default App;