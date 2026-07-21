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
  const { code, fileName, params } = req.body;
  if (!code) return res.status(400).json({ error: "No code provided" });

  const paramsContext = params && Object.keys(params).length > 0 
    ? `\n\nUSER CONFIGURABLE PARAMETER OVERRIDES (Applied via Interactive Control Panel):\n${JSON.stringify(params, null, 2)}\nMake sure the output explicitly reflects these parameter choices!` 
    : '';

  const simulateWithModel = async (modelName: string) => {
    const prompt = `
      You are a high-performance Python execution simulator connected to Google Cloud Colab/Kaggle infrastructure.
      The user wants to "run" this Python file.
      Since this file requires heavy ML libraries (JAX, PyTorch, GraphCast, Beam) or data processing (Xarray, Pandas), 
      your task is to SIMULATE the execution and provide the RESULTS.
      
      File Name: ${fileName}
      Code:
      ${code}
      ${paramsContext}
      
      IMPORTANT: 
      1. If the code defines a model, simulate its initialization and show a summary (like model.summary()).
      2. If the code processes data, generate realistic mock outputs (tables, shapes of arrays, data stats).
      3. If it's a training loop, show logs for a few epochs.
      4. Explicitly mention the parameter overrides if any were provided.
      5. Be professional and technical.
      
      Please provide a JSON response with:
      1. "output": A realistic terminal output with logs, data prints, and success messages.
      2. "explanation": A concise human-readable summary of the data insights and what the results mean for non-coders.
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
      responseText = await simulateWithModel("gemini-3.6-flash");
    } catch (primaryErr: any) {
      const errMsg = primaryErr?.message || JSON.stringify(primaryErr) || String(primaryErr);
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        console.log("Primary model quota/503 hit, trying fallback...");
        responseText = await simulateWithModel("gemini-3.1-flash-lite");
      } else {
        throw primaryErr;
      }
    }
    
    if (!responseText) throw new Error("No response from AI models");

    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    try {
      res.json(JSON.parse(cleanJson));
    } catch (parseErr) {
      res.json({
        output: responseText,
        explanation: "AI simulation completed successfully.",
        status: "success"
      });
    }
  } catch (err: any) {
    console.error(err);
    const errMsg = err?.message || JSON.stringify(err) || String(err);
    if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
      res.status(503).json({ 
        error: "API High Demand / Quota Exceeded", 
        output: "Error: The AI Simulation engine is currently at capacity or experiencing high demand.\n\nThis happens when many users are running scripts simultaneously. \n\nSuggested Action: Wait a few seconds and try again.",
        explanation: "We hit the Google Gemini API limits. Please try again shortly."
      });
    } else {
      res.status(500).json({ error: "Failed to simulate execution" });
    }
  }
});

app.post("/api/ai/flowchart", async (req, res) => {
  const { code, fileName } = req.body;
  if (!code) return res.status(400).json({ error: "No code provided" });

  const flowchartWithModel = async (modelName: string) => {
    const prompt = `
      You are an expert computational logic visualizer.
      Analyze this Python script and convert its logic into a step-by-step visual flowchart for non-technical users.
      File Name: ${fileName}
      Code:
      ${code}

      Return a JSON object with this exact structure:
      {
        "title": "Pipeline Logic Flowchart",
        "summary": "1-2 sentence non-technical overview of what this script accomplishes.",
        "steps": [
          {
            "id": 1,
            "title": "Data Ingestion & Filtering",
            "category": "Data Preprocessing",
            "icon": "Database",
            "description": "Loads the satellite raster bands and filters out high cloud cover pixels.",
            "inputs": ["Raw GeoTIFF / NetCDF", "Cloud Mask Threshold"],
            "outputs": ["Clean Filtered Data Cube"],
            "color": "blue"
          },
          {
            "id": 2,
            "title": "Neural Network Inference",
            "category": "Machine Learning",
            "icon": "Cpu",
            "description": "Passes the filtered image patches into the GraphCast / Vision Transformer model to estimate land surface moisture.",
            "inputs": ["Filtered Data Cube", "Model Weights"],
            "outputs": ["Predicted Moisture Map"],
            "color": "purple"
          },
          {
            "id": 3,
            "title": "Export & Visualization",
            "category": "Output Generation",
            "icon": "FileText",
            "description": "Renders high-resolution interactive maps and exports summary CSV metrics.",
            "inputs": ["Predicted Moisture Map"],
            "outputs": ["GeoJSON Map Overlay", "Summary CSV"],
            "color": "emerald"
          }
        ]
      }
    `;
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });
    return result.text;
  };

  try {
    let responseText;
    try {
      responseText = await flowchartWithModel("gemini-3.6-flash");
    } catch (primaryErr: any) {
      responseText = await flowchartWithModel("gemini-3.1-flash-lite");
    }
    
    if (!responseText) throw new Error("No response from AI models");
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    res.json(JSON.parse(cleanJson));
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate flowchart logic" });
  }
});


app.post("/api/ai/explain", async (req, res) => {
  const { code, fileName } = req.body;
  if (!code) return res.status(400).json({ error: "No code provided" });

  const explainWithModel = async (modelName: string) => {
    const prompt = `
      You are an AI assistant helping a non-technical user understand a Python script.
      File Name: ${fileName}
      Code:
      ${code}
      
      Please explain what this script does in simple, non-technical terms. 
      What is its purpose? What problem does it solve? 
      Keep it brief and easy to understand for someone who doesn't know how to code.
      Format your response as a simple JSON object:
      {
        "explanation": "Your explanation here"
      }
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
      responseText = await explainWithModel("gemini-3.5-flash");
    } catch (primaryErr: any) {
      const errMsg = primaryErr?.message || String(primaryErr);
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        responseText = await explainWithModel("gemini-3.1-flash-lite");
      } else {
        throw primaryErr;
      }
    }
    
    if (!responseText) throw new Error("No response from AI models");
    const cleanJson = responseText.replace(/\x60\x60\x60json\n?|\n?\x60\x60\x60/g, '').trim();
    try {
      res.json(JSON.parse(cleanJson));
    } catch (parseErr) {
      res.json({ explanation: responseText });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to explain execution" });
  }
});

export default app;
