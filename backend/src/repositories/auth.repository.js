const { driver } = require('../config/neo4j');

class AuthRepository {
  /**
   * Tạo user mới trong database. Tự động thêm label dựa vào role.
   * @param {Object} userData
   * @returns {Object|null} Thông tin user vừa tạo, không bao gồm password
   */
  async createUser(userData) {
    const session = driver.session();
    try {
      // Chọn label bổ sung dựa vào role (CANDIDATE hoặc RECRUITER)
      // Mặc định tạo label User và label tương ứng với role.
      const additionalLabel = userData.role === 'RECRUITER' ? 'Recruiter' : 'Candidate';

      // Recruiters are "onboarded" the moment they register — their company name is the primary identity.
      const isOnboardedAtCreation = userData.role === 'RECRUITER';

      const query = `
        CREATE (u:User:${additionalLabel} {
          userId: $userId,
          role: $role,
          fullName: $fullName,
          email: $email,
          password: $password,
          phone: $phone,
          dateOfBirth: $dateOfBirth,
          address: $address,
          isOnboarded: $isOnboarded,
          createdAt: datetime()
        })
        WITH u
        CALL {
          WITH u
          WITH u WHERE u.role = 'RECRUITER' AND $companyName IS NOT NULL
          CREATE (c:Company {
            companyId: randomUUID(),
            name: $companyName,
            createdAt: datetime(),
            updatedAt: datetime()
          })
          CREATE (u)-[:IS_RECRUITER_FOR {role: 'OWNER'}]->(c)
          RETURN c
        }
        RETURN u {
          .userId,
          .role,
          .fullName,
          .email,
          .phone,
          .dateOfBirth,
          .address,
          .isOnboarded,
          .createdAt
        } AS user, c { .companyId, .name } AS company
      `;

      const result = await session.executeWrite(tx => tx.run(query, { ...userData, isOnboarded: isOnboardedAtCreation }));

      if (result.records.length === 0) {
        return null;
      }

      return {
        ...result.records[0].get('user'),
        activeCompany: result.records[0].get('company')
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Tìm kiếm user theo email để kiểm tra xem đã tồn tại chưa
   * @param {string} email
   * @returns {boolean} true nếu email đã tồn tại
   */
  async checkEmailExists(email) {
    const session = driver.session();
    try {
      const query = `
        MATCH (u:User {email: $email})
        RETURN u.userId AS userId
        LIMIT 1
      `;
      const result = await session.executeRead(tx => tx.run(query, { email }));
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  /**
   * Lấy thông tin user (bao gồm mật khẩu) qua email để xác thực đăng nhập
   * @param {string} email
   * @returns {Object|null} user nếu tồn tại
   */
  async getUserByEmail(email) {
    const session = driver.session();
    try {
      // For RECRUITER users, auto-pick the first company (oldest by createdAt) as activeCompany.
      // This enforces "Recruiter IS Company" — the UI never has to ask which company is active.
      const query = `
        MATCH (u:User {email: $email})
        OPTIONAL MATCH (u)-[:IS_RECRUITER_FOR]->(c:Company)
        WITH u, c
        ORDER BY c.createdAt ASC
        WITH u, collect(c)[0] AS firstCompany
        RETURN u {
          .userId,
          .role,
          .fullName,
          .email,
          .password,
          .phone,
          .dateOfBirth,
          .address,
          .avatarUrl,
          .isOnboarded,
          .createdAt
        } AS user,
        CASE WHEN firstCompany IS NULL THEN NULL
             ELSE { companyId: firstCompany.companyId, name: firstCompany.name,
                    logoUrl: firstCompany.logoUrl, industry: firstCompany.industry }
        END AS activeCompany
        LIMIT 1
      `;

      const result = await session.executeRead(tx => tx.run(query, { email }));

      if (result.records.length === 0) {
        return null;
      }

      const user = result.records[0].get('user');
      const activeCompany = result.records[0].get('activeCompany');
      return activeCompany ? { ...user, activeCompany } : user;
    } finally {
      await session.close();
    }
  }

  /**
   * Lưu token reset password và thời gian hết hạn vào user
   * @param {string} email
   * @param {string} token
   * @param {number} expiry
   */
  async saveResetToken(email, token, expiry) {
    const session = driver.session();
    try {
      const query = `
        MATCH (u:User {email: $email})
        SET u.resetPasswordToken = $token,
            u.resetPasswordExpires = $expiry
        RETURN u.userId AS userId
      `;
      const result = await session.executeWrite(tx => tx.run(query, { email, token, expiry }));
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  /**
   * Tìm user bằng reset token và kiểm tra chưa hết hạn
   * @param {string} token
   * @returns {Object|null} user nếu token hợp lệ
   */
  async getUserByResetToken(token) {
    const session = driver.session();
    try {
      const currentTime = Date.now();
      const query = `
        MATCH (u:User {resetPasswordToken: $token})
        WHERE u.resetPasswordExpires > $currentTime
        RETURN u {
          .userId,
          .email,
          .resetPasswordToken,
          .resetPasswordExpires
        } AS user
        LIMIT 1
      `;
      const result = await session.executeRead(tx => tx.run(query, { token, currentTime }));

      if (result.records.length === 0) {
        return null;
      }

      return result.records[0].get('user');
    } finally {
      await session.close();
    }
  }

  /**
   * Cập nhật mật khẩu mới và xóa reset token
   * @param {string} userId
   * @param {string} newHashedPassword
   */
  async updatePasswordAndClearToken(userId, newHashedPassword) {
    const session = driver.session();
    try {
      const query = `
        MATCH (u:User {userId: $userId})
        SET u.password = $newHashedPassword
        REMOVE u.resetPasswordToken, u.resetPasswordExpires
        RETURN u.userId AS userId
      `;
      const result = await session.executeWrite(tx => tx.run(query, { userId, newHashedPassword }));
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

}

module.exports = new AuthRepository();
