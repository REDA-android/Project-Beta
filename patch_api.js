const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');

const newEndpoint = `
app.post("/api/ai/explain", async (req, res) => {
  const { code, fileName } = req.body;
  if (!code) return res.status(400).json({ error: "No code provided" });

  const simulateWithModel = async (modelName) => {
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
      responseText = await simulateWithModel("gemini-3.5-flash");
    } catch (primaryErr) {
      const errMsg = primaryErr?.message || String(primaryErr);
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('503')) {
        responseText = await simulateWithModel("gemini-3.1-flash-lite");
      } else {
        throw primaryErr;
      }
    }
    
    if (!responseText) throw new Error("No response");
    const cleanJson = responseText.replace(/\\`\\`\\`json\\n?|\\n?\\`\\`\\`/g, '').trim();
    try {
      res.json(JSON.parse(cleanJson));
    } catch (e) {
      res.json({ explanation: responseText });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to explain" });
  }
});
`;

content = content.replace('export default app;', newEndpoint + '\nexport default app;');
fs.writeFileSync('api/index.ts', content);
