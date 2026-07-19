import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(express.json());

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || ""
});

app.get("/api/files/content", async (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath || filePath.includes('..')) {
    return res.status(400).json({ error: "Invalid path" });
  }
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = await fs.promises.readFile(fullPath, 'utf-8');
    res.json({ content });
  } catch (err) {
    res.status(404).json({ error: "File not found" });
  }
});

app.post("/api/ai/simulate", async (req, res) => {
  const { code, fileName } = req.body;
  if (!code) return res.status(400).json({ error: "No code provided" });

  const simulateWithModel = async (modelName: string) => {
    const prompt = `
      You are a high-performance Python execution simulator. The user wants to "run" this Python file.
      Since this file requires heavy ML libraries (JAX, PyTorch, GraphCast, Beam) or data processing (Xarray, Pandas), 
      your task is to SIMULATE the execution and provide the RESULTS.
      
      File Name: ${fileName}
      Code:
      ${code}
      
      IMPORTANT: 
      1. If the code defines a model, simulate its initialization and show a summary (like model.summary()).
      2. If the code processes data, generate realistic mock outputs (tables, shapes of arrays, data stats).
      3. If it's a training loop, show logs for a few epochs.
      4. Be professional and technical.
      
      Please provide a JSON response with:
      1. "output": A realistic terminal output with logs, data prints, and success messages.
      2. "explanation": A concise human-readable summary of the data insights and what the results mean.
      3. "status": "success" or "error"
    `;

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    return result.text;
  };

  try {
    let responseText;
    try {
      // Try primary model (gemini-3.5-flash)
      responseText = await simulateWithModel("gemini-3.5-flash");
    } catch (primaryErr: any) {
      if (primaryErr.message?.includes('429') || primaryErr.message?.includes('quota')) {
        console.log("Primary model quota hit, trying fallback...");
        // Fallback to gemini-3.1-flash-lite which has separate quota
        responseText = await simulateWithModel("gemini-3.1-flash-lite");
      } else {
        throw primaryErr;
      }
    }
    
    if (!responseText) throw new Error("No response from AI models");

    // Clean up markdown code blocks if present
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    try {
      res.json(JSON.parse(cleanJson));
    } catch (parseErr) {
      // Fallback if AI doesn't return pure JSON
      res.json({
        output: responseText,
        explanation: "AI simulation completed, but results were returned in unstructured format.",
        status: "success"
      });
    }
  } catch (err: any) {
    console.error(err);
    if (err.message?.includes('429') || err.message?.includes('quota')) {
      res.status(429).json({ 
        error: "API Quota Exceeded", 
        output: "Error: The AI Simulation engine is currently at capacity.\n\nThis happens when many users are running scripts simultaneously on the free-tier API. \n\nSuggested Action: Wait 30-60 seconds and click 'Run Script' again.",
        explanation: "We hit the Google Gemini API rate limits. Please try again shortly."
      });
    } else {
      res.status(500).json({ error: "Failed to simulate execution" });
    }
  }
});

export default app;
