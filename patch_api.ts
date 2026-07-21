import fs from 'fs';

const content = fs.readFileSync('api/index.ts', 'utf8');
const exportString = 'export default app;';

const newEndpoint = `
app.post("/api/ai/explain", async (req, res) => {
  const { code, fileName } = req.body;
  if (!code) return res.status(400).json({ error: "No code provided" });

  const explainWithModel = async (modelName: string) => {
    const prompt = \`
      You are an AI assistant helping a non-technical user understand a Python script.
      File Name: \${fileName}
      Code:
      \${code}
      
      Please explain what this script does in simple, non-technical terms. 
      What is its purpose? What problem does it solve? 
      Keep it brief and easy to understand for someone who doesn't know how to code.
      Format your response as a simple JSON object:
      {
        "explanation": "Your explanation here"
      }
    \`;
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
    const cleanJson = responseText.replace(/\\x60\\x60\\x60json\\n?|\\n?\\x60\\x60\\x60/g, '').trim();
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
`;

fs.writeFileSync('api/index.ts', content.replace(exportString, newEndpoint + '\\n' + exportString));
