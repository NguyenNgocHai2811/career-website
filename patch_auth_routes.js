const fs = require('fs');

const path = 'backend/src/routes/auth.routes.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('router.post(\'/login\'')) {
  content = content.replace(
    /module\.exports = router;/,
    "// Route xử lý việc đăng nhập (POST /v1/auth/login)\nrouter.post('/login', authController.login);\n\nmodule.exports = router;"
  );
  fs.writeFileSync(path, content, 'utf8');
}
