const fs = require('fs');
const file = 'client/src/pages/Register/Register.jsx';
let content = fs.readFileSync(file, 'utf8');

// The sed output showed backslashes before the single quotes: `role === \'candidate\' ? \'border-primary bg-primary/5\' : \'border-[#d2d5e5] dark:border-white/10 bg-transparent hover:border-primary/50\'`
// Let's replace those with actual single quotes.
content = content.replace(/\\'/g, "'");

fs.writeFileSync(file, content);
