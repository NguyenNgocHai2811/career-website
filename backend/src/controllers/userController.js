const userService = require('../services/userService');

const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const newUser = await userService.registerUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.userId;
    await userService.completeOnboarding(userId);
    res.status(200).json({ message: 'Onboarding completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const profile = await userService.getUserProfile(userId);
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  completeOnboarding,
  getUserProfile
};
