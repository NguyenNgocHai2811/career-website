const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const accountRepository = require('../repositories/account.repository');
const emailUtil = require('../utils/email');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../utils/errors');

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const createToken = () => crypto.randomBytes(32).toString('hex');

const sanitizeAccountForToken = (account) => ({
  userId: account.userId,
  role: account.role,
  fullName: account.fullName,
  email: account.email,
  phone: account.phone,
  dateOfBirth: account.dateOfBirth,
  address: account.address,
  emailVerified: account.emailVerified,
});

const buildVerificationUrl = (originUrl, token) => {
  const origin = originUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${origin.replace(/\/$/, '')}/settings?verifyEmailToken=${encodeURIComponent(token)}`;
};

const getExistingAccount = async (userId) => {
  const account = await accountRepository.getAccountById(userId);
  if (!account) throw new NotFoundError('Account not found');
  return account;
};

const getCredentials = async (userId) => {
  const credentials = await accountRepository.getUserCredentials(userId);
  if (!credentials) throw new NotFoundError('Account not found');
  if (credentials.isBanned) throw new UnauthorizedError('Account is banned');
  if (credentials.isDeactivated) throw new UnauthorizedError('Account is deactivated');
  return credentials;
};

const requirePasswordMatch = async (userId, currentPassword) => {
  if (!currentPassword) throw new BadRequestError('Current password is required');
  const credentials = await getCredentials(userId);
  const isValid = await bcrypt.compare(currentPassword, credentials.password || '');
  if (!isValid) throw new UnauthorizedError('Current password is incorrect');
  return credentials;
};

const getAccount = async (userId) => getExistingAccount(userId);

const updateAccount = async (userId, data = {}) => {
  const allowed = {
    fullName: data.fullName,
    phone: data.phone,
    address: data.address,
    dateOfBirth: data.dateOfBirth,
  };

  if (allowed.fullName !== undefined && !String(allowed.fullName).trim()) {
    throw new BadRequestError('Full name is required');
  }

  const account = await accountRepository.updateAccount(userId, allowed);
  if (!account) throw new NotFoundError('Account not found');
  return account;
};

const changePassword = async (userId, { currentPassword, newPassword, confirmPassword } = {}) => {
  if (!newPassword || newPassword.length < 8) {
    throw new BadRequestError('New password must be at least 8 characters');
  }
  if (newPassword !== confirmPassword) {
    throw new BadRequestError('New password confirmation does not match');
  }

  await requirePasswordMatch(userId, currentPassword);
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updated = await accountRepository.updatePassword(userId, hashedPassword);
  if (!updated) throw new NotFoundError('Account not found');
  return { success: true };
};

const updateEmail = async (userId, { currentPassword, newEmail } = {}, originUrl) => {
  const email = normalizeEmail(newEmail);
  if (!EMAIL_REGEX.test(email)) throw new BadRequestError('Email format is invalid');

  const credentials = await requirePasswordMatch(userId, currentPassword);
  if (normalizeEmail(credentials.email) === email) {
    throw new BadRequestError('New email must be different from current email');
  }

  const existing = await accountRepository.getUserByEmail(email);
  if (existing && existing.userId !== userId) {
    throw new BadRequestError('Email is already in use');
  }

  const token = createToken();
  const expiresAt = Date.now() + VERIFICATION_TTL_MS;
  const user = await accountRepository.updateEmailWithVerification(userId, email, token, expiresAt);
  if (!user) throw new NotFoundError('Account not found');

  let verificationSent = true;
  try {
    await emailUtil.sendVerificationEmail(email, buildVerificationUrl(originUrl, token));
  } catch (error) {
    verificationSent = false;
    console.error('[accountService.updateEmail] Verification email failed:', error.message);
  }

  return { user, tokenUser: sanitizeAccountForToken(user), verificationSent };
};

const requestEmailVerification = async (userId, originUrl) => {
  const account = await getExistingAccount(userId);
  if (account.emailVerified) {
    return { sent: false, alreadyVerified: true };
  }

  const token = createToken();
  const email = await accountRepository.saveEmailVerificationToken(
    userId,
    token,
    Date.now() + VERIFICATION_TTL_MS
  );
  if (!email) throw new NotFoundError('Account not found');

  await emailUtil.sendVerificationEmail(email, buildVerificationUrl(originUrl, token));
  return { sent: true };
};

const verifyEmail = async (token) => {
  if (!token) throw new BadRequestError('Verification token is required');
  const account = await accountRepository.verifyEmailToken(token);
  if (!account) throw new BadRequestError('Verification token is invalid or expired');
  return { user: account, tokenUser: sanitizeAccountForToken(account) };
};

const updateNotificationPreferences = async (userId, preferences = {}) => {
  const normalized = {
    email: preferences.email !== false,
    push: preferences.push !== false,
    jobAlerts: preferences.jobAlerts !== false,
    messages: preferences.messages !== false,
  };
  const account = await accountRepository.updateNotificationPreferences(userId, normalized);
  if (!account) throw new NotFoundError('Account not found');
  return account;
};

const deactivateAccount = async (userId, { currentPassword, confirmation } = {}) => {
  if (confirmation !== 'DEACTIVATE') {
    throw new BadRequestError('Confirmation must be DEACTIVATE');
  }
  await requirePasswordMatch(userId, currentPassword);
  const updated = await accountRepository.deactivateAccount(userId);
  if (!updated) throw new NotFoundError('Account not found');
  return { success: true };
};

module.exports = {
  getAccount,
  updateAccount,
  changePassword,
  updateEmail,
  requestEmailVerification,
  verifyEmail,
  updateNotificationPreferences,
  deactivateAccount,
};
