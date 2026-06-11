import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment. Please add it via the Settings > Secrets menu.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST route to query the Senior ML Engineer & Architect chatbot
app.post("/api/query-architecture", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message parameter is required." });
    }

    const ai = getGeminiClient();

    // Prepare system instructions establishing persona
    const systemInstruction = `
      You are a Principal AI Engineer, Senior Machine Learning Engineer, and Systems Architect specializing in offline TTS systems on Windows.
      You are helping a senior student submit their internship project: "Multilingual Expressive Text-to-Speech System with Web UI" supporting English, Hindi, Kannada, and Telugu.
      
      Expertise level: Elite, scientific, yet approachable and encouraging.
      Your goal is to answer queries about:
      1. Open-source TTS options (Piper, VITS, XTTS-v2, Bark) and trade-offs.
      2. Dravidian linguistics (Language-specific phonological rules like Otthakshara in Kannada, continuous vowel ends, Gemination, Retroflex consonant ಳ/ఱ mapping, Hindi schwa deletion).
      3. Windows CPU and GPU optimizations (ONNX runtime, FP16 quantization, WASAPI audio drivers, threading, batching).
      4. Fully offline setups, file directory structures, REST API architectures, and pipeline designs.
      
      Provide crisp, authoritative, production-ready, bulletproof engineering advice. Avoid generic filler. If asked about code, write clean Python or Batch code snippet structures. Keep responses beautifully formatted in Markdown.
    `;

    // Map history to the format required by the Chat API, or standard generation
    // To make it highly reliable, we'll compile all context in a structured prompt
    let conversationPrompt = "Here is the conversation history so far:\n";
    if (history && Array.isArray(history)) {
      history.forEach((turn: any) => {
        const speaker = turn.role === "user" ? "Student" : "Principal Engineer";
        conversationPrompt += `${speaker}: ${turn.content}\n`;
      });
    }
    conversationPrompt += `Student: ${message}\nPrincipal Engineer:`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: conversationPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ response: result.text || "No response received from model." });
  } catch (error: any) {
    console.error("Gemini API Error in backend:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred in the AI server context.",
    });
  }
});

// Setup dev server vs production static asset directories
async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite Dev Server Integration.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving Compiled Frontend from: ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend API and UI available at http://0.0.0.0:${PORT}`);
  });
}

serveApp().catch((err) => {
  console.error("Failed to boot full-stack Express server:", err);
});
