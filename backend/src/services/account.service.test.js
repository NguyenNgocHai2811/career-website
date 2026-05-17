const bcrypt = require('bcryptjs');

jest.mock('../repositories/account.repository', () => ({
  getAccountById: jest.fn(),
  getUserCredentials: jest.fn(),
  getUserByEmail: jest.fn(),
  updateAccount: jest.fn(),
  updateEmailWithVerification: jest.fn(),
  updatePassword: jest.fn(),
  updateNotificationPreferences: jest.fn(),
  deactivateAccount: jest.fn(),
  saveEmailVerificationToken: jest.fn(),
  verifyEmailToken: jest.fn(),
}));

jest.mock('../utils/email', () => ({
  sendVerificationEmail: jest.fn(),
}));

const accountRepository = require('../repositories/account.repository');
const emailUtil = require('../utils/email');
const accountService = require('./account.service');

describe('accountService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('changePassword', () => {
    it('rejects an incorrect current password', async () => {
      accountRepository.getUserCredentials.mockResolvedValue({
        userId: 'user-1',
        password: await bcrypt.hash('correct-password', 10),
      });

      await expect(accountService.changePassword('user-1', {
        currentPassword: 'wrong-password',
        newPassword: 'new-password-123',
        confirmPassword: 'new-password-123',
      })).rejects.toThrow('Current password is incorrect');

      expect(accountRepository.updatePassword).not.toHaveBeenCalled();
    });

    it('hashes and stores the new password after validating the current password', async () => {
      accountRepository.getUserCredentials.mockResolvedValue({
        userId: 'user-1',
        password: await bcrypt.hash('old-password-123', 10),
      });
      accountRepository.updatePassword.mockResolvedValue(true);

      await accountService.changePassword('user-1', {
        currentPassword: 'old-password-123',
        newPassword: 'new-password-123',
        confirmPassword: 'new-password-123',
      });

      expect(accountRepository.updatePassword).toHaveBeenCalledTimes(1);
      const hashed = accountRepository.updatePassword.mock.calls[0][1];
      await expect(bcrypt.compare('new-password-123', hashed)).resolves.toBe(true);
    });
  });

  describe('updateEmail', () => {
    it('rejects an email already owned by another user', async () => {
      accountRepository.getUserCredentials.mockResolvedValue({
        userId: 'user-1',
        email: 'old@example.com',
        password: await bcrypt.hash('password-123', 10),
      });
      accountRepository.getUserByEmail.mockResolvedValue({
        userId: 'user-2',
        email: 'new@example.com',
      });

      await expect(accountService.updateEmail('user-1', {
        currentPassword: 'password-123',
        newEmail: 'new@example.com',
      }, 'http://localhost:5173')).rejects.toThrow('Email is already in use');

      expect(accountRepository.updateEmailWithVerification).not.toHaveBeenCalled();
    });

    it('updates the email as unverified and sends a verification link', async () => {
      accountRepository.getUserCredentials.mockResolvedValue({
        userId: 'user-1',
        email: 'old@example.com',
        password: await bcrypt.hash('password-123', 10),
      });
      accountRepository.getUserByEmail.mockResolvedValue(null);
      accountRepository.updateEmailWithVerification.mockResolvedValue({
        userId: 'user-1',
        email: 'new@example.com',
        emailVerified: false,
      });
      emailUtil.sendVerificationEmail.mockResolvedValue({ messageId: 'mail-1' });

      const result = await accountService.updateEmail('user-1', {
        currentPassword: 'password-123',
        newEmail: 'new@example.com',
      }, 'http://localhost:5173');

      expect(result.user.email).toBe('new@example.com');
      expect(result.user.emailVerified).toBe(false);
      expect(result.verificationSent).toBe(true);
      expect(accountRepository.updateEmailWithVerification).toHaveBeenCalledWith(
        'user-1',
        'new@example.com',
        expect.any(String),
        expect.any(Number)
      );
      expect(emailUtil.sendVerificationEmail).toHaveBeenCalledWith(
        'new@example.com',
        expect.stringContaining('/settings?verifyEmailToken=')
      );
    });
  });

  describe('deactivateAccount', () => {
    it('soft deactivates only after password confirmation', async () => {
      accountRepository.getUserCredentials.mockResolvedValue({
        userId: 'user-1',
        password: await bcrypt.hash('password-123', 10),
      });
      accountRepository.deactivateAccount.mockResolvedValue(true);

      await accountService.deactivateAccount('user-1', {
        currentPassword: 'password-123',
        confirmation: 'DEACTIVATE',
      });

      expect(accountRepository.deactivateAccount).toHaveBeenCalledWith('user-1');
    });
  });
});
