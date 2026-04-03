const userRepository = require('../repositories/userRepository');

const getUsers = async () => {
  return await userRepository.getAllUsers();
};

const registerUser = async (data) => {
  // Add business logic here (e.g., validation, check if email exists)
  if (!data.email || !data.name) {
    throw new Error('Email and Name are required');
  }
  return await userRepository.createUser(data);
};

const completeOnboarding = async (userId) => {
  return await userRepository.completeOnboarding(userId);
};

module.exports = {
  getUsers,
  registerUser,
  completeOnboarding
};
