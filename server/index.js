import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

dotenv.config();

// -------------------------------------
// ZOD VALIDATION SCHEMA
// -------------------------------------

const studySchema = z.object({
  title: z.string(),

  summary: z.string(),

  flashcards: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .length(5),

  quiz: z
    .array(
      z
        .object({
          question: z.string(),

          options: z
            .array(z.string())
            .length(4),

          answer: z.string(),
        })
        .refine(
          (quizQuestion) =>
            quizQuestion.options.includes(
              quizQuestion.answer
            ),
          {
            message:
              "Quiz answer must match one of the options",
          }
        )
    )
    .length(5),
});

// -------------------------------------
// EXPRESS APP
// -------------------------------------

const app = express();

app.use(cors());
app.use(express.json());

// -------------------------------------
// GEMINI
// -------------------------------------

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// -------------------------------------
// TEST ENDPOINT
// -------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "Study Assistant backend is running!",
  });
});

// -------------------------------------
// STUDY GENERATION ENDPOINT
// -------------------------------------

app.post("/api/study", async (req, res) => {
  try {
    const { topic } = req.body;

    // Check topic
    if (!topic || !topic.trim()) {
      return res.status(400).json({
        error: "Topic is required",
      });
    }

    // -------------------------------------
    // PROMPT
    // -------------------------------------

    const prompt = `
You are StudyMate AI, an expert educational assistant.

Your job is to create accurate, clear, engaging study material for students.

Topic:
"${topic}"

Return ONLY one valid JSON object.

Do not use Markdown.
Do not wrap the JSON in code fences.
Do not add explanations before or after the JSON.

The JSON must follow EXACTLY this structure:

{
  "title": "string",
  "summary": "string",
  "flashcards": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "quiz": [
    {
      "question": "string",
      "options": [
        "string",
        "string",
        "string",
        "string"
      ],
      "answer": "string"
    }
  ]
}

CONTENT REQUIREMENTS:

1. TITLE
- Create a short, clear title that accurately represents the topic.

2. SUMMARY
- Explain the topic in beginner-friendly language.
- Focus on the most important concepts.
- Include important terms, processes, facts, or relationships.
- Avoid unnecessary repetition.
- Make the explanation useful for exam preparation.
- Do not use Markdown formatting.

3. FLASHCARDS
- Create exactly 5 flashcards.
- Focus on the most important concepts from the topic.
- Questions should test understanding, not just memorization.
- Keep questions clear and concise.
- Answers should be accurate and easy to understand.
- Do not create duplicate or nearly identical questions.

4. QUIZ
- Create exactly 5 multiple-choice questions.
- Each question must have exactly 4 options.
- Questions should cover different parts of the topic.
- Use a mixture of easy, medium, and challenging questions.
- Incorrect options should be plausible but clearly incorrect.
- Do not create duplicate questions.
- The correct answer must be exactly identical to one of the four options.

5. ACCURACY
- Never invent facts.
- If the topic contains scientific or technical information, use standard accepted explanations.
- Prioritize correctness over creativity.

6. JSON
- Return valid JSON only.
- Use double quotes for all JSON keys and string values.
- Do not include trailing commas.
`;

    // -------------------------------------
    // CALL GEMINI
    // -------------------------------------

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    // -------------------------------------
    // GET GEMINI RESPONSE
    // -------------------------------------

    const text = response.text;

    if (!text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    // -------------------------------------
    // CLEAN RESPONSE
    // -------------------------------------

    const cleanedText = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // -------------------------------------
    // CONVERT JSON STRING → OBJECT
    // -------------------------------------

    let studyData;

    try {
      studyData = JSON.parse(cleanedText);
    } catch (jsonError) {
      console.error(
        "Invalid JSON from Gemini:",
        cleanedText
      );

      throw new Error(
        "AI returned invalid JSON. Please try again."
      );
    }

    // -------------------------------------
    // VALIDATE WITH ZOD
    // -------------------------------------

    const validatedData =
      studySchema.parse(studyData);

    // -------------------------------------
    // SEND DATA TO REACT
    // -------------------------------------

    res.json(validatedData);

  } catch (error) {
    console.error("Study generation error:", error);

    res.status(500).json({
      error:
        error?.message ||
        "Something went wrong while generating the study material.",
    });
  }
});

// -------------------------------------
// START SERVER
// -------------------------------------

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Study Assistant backend running on http://localhost:${PORT}`
  );
});