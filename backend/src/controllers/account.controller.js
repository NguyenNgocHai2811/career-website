const accountService = require('../services/account.service');
const catchAsync = require('../utils/catchAsync');

const getOriginUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

const getAccount = catchAsync(async (req, res) => {
  const account = await accountService.getAccount(req.user.userId);
  res.status(200).json({ success: true, data: account });
});

const updateAccount = catchAsync(async (req, res) => {
  const account = await accountService.updateAccount(req.user.userId, req.body);
  res.status(200).json({ success: true, data: account });
});

const changePassword = catchAsync(async (req, res) => {
  await accountService.changePassword(req.user.userId, req.body);
  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

const updateEmail = catchAsync(async (req, res) => {
  const result = await accountService.updateEmail(req.user.userId, req.body, getOriginUrl());
  res.status(200).json({
    success: true,
    data: result.user,
    tokenUser: result.tokenUser,
    verificationSent: result.verificationSent,
  });
});

const requestEmailVerification = catchAsync(async (req, res) => {
  const result = await accountService.requestEmailVerification(req.user.userId, getOriginUrl());
  res.status(200).json({ success: true, data: result });
});

const verifyEmail = catchAsync(async (req, res) => {
  const result = await accountService.verifyEmail(req.query.token);
  res.status(200).json({ success: true, data: result.user, tokenUser: result.tokenUser });
});

const updateNotificationPreferences = catchAsync(async (req, res) => {
  const account = await accountService.updateNotificationPreferences(req.user.userId, req.body);
  res.status(200).json({ success: true, data: account.notificationPreferences });
});

const deactivateAccount = catchAsync(async (req, res) => {
  await accountService.deactivateAccount(req.user.userId, req.body);
  res.status(200).json({ success: true, message: 'Account deactivated successfully' });
});

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
