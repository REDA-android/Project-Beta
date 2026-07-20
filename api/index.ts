import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";

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

app.post("/api/ai/convert-to-react", async (req, res) => {
  const { code, fileName } = req.body;
  if (!code) return res.status(400).json({ error: "No code provided" });

  const convertWithModel = async (modelName: string) => {
    const prompt = `
      You are an expert full-stack developer who converts Python files used in scientific, AI, and hydrological research into beautiful, functional React/TypeScript components.
      
      Convert the following Python file into an elegant, modern, highly interactive, production-ready React component (written in TypeScript).
      
      File Name: ${fileName}
      Code:
      ${code}
      
      Requirements:
      1. The converted component must be highly polished, visually stunning, using Tailwind CSS utility classes and Lucide-react icons (imported from 'lucide-react').
      2. Map all major Python logical structures, formulas, variables, and outputs into interactive React state (using useState, useEffect, etc.) so that the user can tune parameters and see the calculations update in real time.
      3. Create responsive, beautiful visual mockups for the data structures, array shapes, tensors, or spatial grids defined in the Python code (using SVG paths/charts/grids or clean styled tables).
      4. Write clean, idiomatic TypeScript. Ensure there are no TypeScript compiler errors. Do not use complex libraries other than 'lucide-react' for icons. If charts or graphs are needed, draw them using simple, responsive SVG elements or standard styled HTML blocks.
      5. The output must be just the React/TypeScript code block, starting with standard imports and ending with the default export component.
      
      Please return a JSON response with:
      1. "code": The full React/TypeScript component code string.
      2. "explanation": A concise, highly professional summary explaining:
         - How the Python structures (e.g. models, tensor calculations, datasets) were translated to React.
         - The interactive controls and state parameters introduced.
      
      Format the response as a single, valid JSON object with the "code" and "explanation" keys.
    `;

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING, description: "The translated React/TypeScript component source code." },
            explanation: { type: Type.STRING, description: "A concise summary of the translation mapping." }
          },
          required: ["code", "explanation"]
        }
      }
    });
    return result.text;
  };

  try {
    let responseText;
    try {
      responseText = await convertWithModel("gemini-3.5-flash");
    } catch (primaryErr: any) {
      if (primaryErr.message?.includes('429') || primaryErr.message?.includes('quota')) {
        console.log("Primary model quota hit, trying fallback...");
        responseText = await convertWithModel("gemini-3.1-flash-lite");
      } else {
        throw primaryErr;
      }
    }
    
    if (!responseText) throw new Error("No response from AI models");
    res.json(JSON.parse(responseText.trim()));
  } catch (err: any) {
    console.error(err);
    if (err.message?.includes('429') || err.message?.includes('quota')) {
      res.status(429).json({ 
        error: "API Quota Exceeded", 
        code: "// Error: AI conversion engine is at capacity.\n// Please wait 30 seconds and try again.",
        explanation: "Gemini API quota exceeded. Please try again in 30 seconds."
      });
    } else {
      res.status(500).json({ error: "Failed to convert python to React/TypeScript" });
    }
  }
});

export default app;
