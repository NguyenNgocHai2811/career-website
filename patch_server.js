const fs = require('fs');
const file = 'backend/src/server.js';
let content = fs.readFileSync(file, 'utf8');

// Add Express json middleware
if (!content.includes('app.use(express.json());')) {
  content = content.replace('const app = express();', 'const app = express();\n\n// Middleware parse JSON body\napp.use(express.json());');
}

// Add routes
if (!content.includes('const authRoutes = require(\\\'./routes/auth.routes\\\');')) {
  content = content.replace('const app = express();', 'const authRoutes = require(\\\'./routes/auth.routes\\\');\nconst app = express();');
}

if (!content.includes('app.use(\\\'/v1/auth\\\', authRoutes);')) {
  content = content.replace('const startServer = async () => {', '// Mount API routes\napp.use(\\\'/v1/auth\\\', authRoutes);\n\nconst startServer = async () => {');
}

fs.writeFileSync(file, content);
