const fs = require('fs');
const path = 'backend/src/repositories/auth.repository.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('async getUserByEmail(email)')) {
  const getMethod = `
  /**
   * Lấy thông tin user (bao gồm mật khẩu) qua email để xác thực đăng nhập
   * @param {string} email
   * @returns {Object|null} user nếu tồn tại
   */
  async getUserByEmail(email) {
    const session = driver.session();
    try {
      const query = \`
        MATCH (u:User {email: $email})
        RETURN u {
          .userId,
          .role,
          .fullName,
          .email,
          .password,
          .phone,
          .dateOfBirth,
          .address,
          .createdAt
        } AS user
        LIMIT 1
      \`;

      const result = await session.executeRead(tx => tx.run(query, { email }));

      if (result.records.length === 0) {
        return null;
      }

      return result.records[0].get('user');
    } finally {
      await session.close();
    }
  }
`;

  content = content.replace(/}\s*module\.exports = new AuthRepository\(\);/, getMethod + '\n}\n\nmodule.exports = new AuthRepository();');
  fs.writeFileSync(path, content, 'utf8');
}
