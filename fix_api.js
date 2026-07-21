const fs = require('fs');
let text = fs.readFileSync('api/index.ts', 'utf8');
text = text.replace('\\nexport default app;', '\nexport default app;');
fs.writeFileSync('api/index.ts', text);
