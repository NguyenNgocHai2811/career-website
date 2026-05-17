const { driver } = require('../config/neo4j');

const toBoolean = (value, fallback = true) => (
  typeof value === 'boolean' ? value : fallback
);

const mapAccount = (props = {}) => ({
  userId: props.userId,
  role: props.role || '',
  fullName: props.fullName || '',
  email: props.email || '',
  emailVerified: props.emailVerified === true,
  phone: props.phone || '',
  address: props.address || '',
  dateOfBirth: props.dateOfBirth || '',
  isBanned: props.isBanned === true,
  isDeactivated: props.isDeactivated === true,
  notificationPreferences: {
    email: toBoolean(props.notificationEmail, true),
    push: toBoolean(props.notificationPush, true),
    jobAlerts: toBoolean(props.notificationJobAlerts, true),
    messages: toBoolean(props.notificationMessages, true),
  },
});

const getAccountById = async (userId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       RETURN u {
         .userId,
         .role,
         .fullName,
         .email,
         .emailVerified,
         .phone,
         .address,
         .dateOfBirth,
         .isBanned,
         .isDeactivated,
         .notificationEmail,
         .notificationPush,
         .notificationJobAlerts,
         .notificationMessages
       } AS account`,
      { userId }
    );
    if (result.records.length === 0) return null;
    return mapAccount(result.records[0].get('account'));
  } finally {
    await session.close();
  }
};

const getUserCredentials = async (userId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       RETURN u {
         .userId,
         .email,
         .password,
         .isBanned,
         .isDeactivated,
         .emailVerified
       } AS user`,
      { userId }
    );
    return result.records[0]?.get('user') || null;
  } finally {
    await session.close();
  }
};

const getUserByEmail = async (email) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {email: $email})
       RETURN u { .userId, .email } AS user
       LIMIT 1`,
      { email }
    );
    return result.records[0]?.get('user') || null;
  } finally {
    await session.close();
  }
};

const updateAccount = async (userId, data) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       SET u.fullName = COALESCE($fullName, u.fullName),
           u.phone = COALESCE($phone, u.phone),
           u.address = COALESCE($address, u.address),
           u.dateOfBirth = COALESCE($dateOfBirth, u.dateOfBirth),
           u.updatedAt = datetime()
       RETURN u {
         .userId,
         .role,
         .fullName,
         .email,
         .emailVerified,
         .phone,
         .address,
         .dateOfBirth,
         .isBanned,
         .isDeactivated,
         .notificationEmail,
         .notificationPush,
         .notificationJobAlerts,
         .notificationMessages
       } AS account`,
      {
        userId,
        fullName: data.fullName ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        dateOfBirth: data.dateOfBirth ?? null,
      }
    );
    if (result.records.length === 0) return null;
    return mapAccount(result.records[0].get('account'));
  } finally {
    await session.close();
  }
};

const updateEmailWithVerification = async (userId, email, token, expiresAt) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       SET u.email = $email,
           u.emailVerified = false,
           u.emailVerificationToken = $token,
           u.emailVerificationExpires = $expiresAt,
           u.updatedAt = datetime()
       RETURN u {
         .userId,
         .role,
         .fullName,
         .email,
         .emailVerified,
         .phone,
         .address,
         .dateOfBirth,
         .isBanned,
         .isDeactivated,
         .notificationEmail,
         .notificationPush,
         .notificationJobAlerts,
         .notificationMessages
       } AS account`,
      { userId, email, token, expiresAt }
    );
    if (result.records.length === 0) return null;
    return mapAccount(result.records[0].get('account'));
  } finally {
    await session.close();
  }
};

const saveEmailVerificationToken = async (userId, token, expiresAt) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       SET u.emailVerificationToken = $token,
           u.emailVerificationExpires = $expiresAt,
           u.updatedAt = datetime()
       RETURN u.email AS email`,
      { userId, token, expiresAt }
    );
    return result.records[0]?.get('email') || null;
  } finally {
    await session.close();
  }
};

const verifyEmailToken = async (token) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {emailVerificationToken: $token})
       WHERE u.emailVerificationExpires > $now
       SET u.emailVerified = true,
           u.updatedAt = datetime()
       REMOVE u.emailVerificationToken, u.emailVerificationExpires
       RETURN u {
         .userId,
         .role,
         .fullName,
         .email,
         .emailVerified,
         .phone,
         .address,
         .dateOfBirth,
         .isBanned,
         .isDeactivated,
         .notificationEmail,
         .notificationPush,
         .notificationJobAlerts,
         .notificationMessages
       } AS account`,
      { token, now: Date.now() }
    );
    if (result.records.length === 0) return null;
    return mapAccount(result.records[0].get('account'));
  } finally {
    await session.close();
  }
};

const updatePassword = async (userId, hashedPassword) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       SET u.password = $hashedPassword,
           u.passwordUpdatedAt = datetime(),
           u.updatedAt = datetime()
       RETURN u.userId AS userId`,
      { userId, hashedPassword }
    );
    return result.records.length > 0;
  } finally {
    await session.close();
  }
};

const updateNotificationPreferences = async (userId, preferences) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       SET u.notificationEmail = $email,
           u.notificationPush = $push,
           u.notificationJobAlerts = $jobAlerts,
           u.notificationMessages = $messages,
           u.updatedAt = datetime()
       RETURN u {
         .userId,
         .role,
         .fullName,
         .email,
         .emailVerified,
         .phone,
         .address,
         .dateOfBirth,
         .isBanned,
         .isDeactivated,
         .notificationEmail,
         .notificationPush,
         .notificationJobAlerts,
         .notificationMessages
       } AS account`,
      {
        userId,
        email: preferences.email,
        push: preferences.push,
        jobAlerts: preferences.jobAlerts,
        messages: preferences.messages,
      }
    );
    if (result.records.length === 0) return null;
    return mapAccount(result.records[0].get('account'));
  } finally {
    await session.close();
  }
};

const deactivateAccount = async (userId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       SET u.isDeactivated = true,
           u.deactivatedAt = datetime(),
           u.updatedAt = datetime()
       RETURN u.userId AS userId`,
      { userId }
    );
    return result.records.length > 0;
  } finally {
    await session.close();
  }
};

module.exports = {
  getAccountById,
  getUserCredentials,
  getUserByEmail,
  updateAccount,
  updateEmailWithVerification,
  updatePassword,
  updateNotificationPreferences,
  deactivateAccount,
  saveEmailVerificationToken,
  verifyEmailToken,
};
