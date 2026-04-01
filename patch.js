const fs = require('fs');
const file = 'client/src/pages/Homepage/HomePage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add import Link from 'react-router-dom'
if (!content.includes("import { Link } from 'react-router-dom';")) {
  content = content.replace("import React from 'react';", "import React from 'react';\nimport { Link } from 'react-router-dom';");
}

// Replace Join Now button with Link
content = content.replace(
  '<button className="flex items-center justify-center rounded-xl h-10 px-6 bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 text-sm font-bold transition-all transform hover:scale-[1.05] hover:shadow-primary/40">\n                Join Now\n              </button>',
  '<Link to="/register" className="flex items-center justify-center rounded-xl h-10 px-6 bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 text-sm font-bold transition-all transform hover:scale-[1.05] hover:shadow-primary/40">\n                Join Now\n              </Link>'
);

fs.writeFileSync(file, content);
