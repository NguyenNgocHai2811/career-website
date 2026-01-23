const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const register = async (data) => {
  const { email, password, fullName, role } = data;

  if (!email || !password || !fullName) {
    throw new Error('Missing required fields: email, password, fullName');
  }

  // Check if user exists
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await userRepository.createUser({
    email,
    password: hashedPassword,
    fullName,
    role: role || 'CANDIDATE' // Default role
  });

  // Generate Token
  const token = jwt.sign(
    { userId: newUser.userId, email: newUser.email, role: newUser.role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '24h' }
  );

  // Return user info without password
  const { password: _, ...userWithoutPassword } = newUser;

  return { token, user: userWithoutPassword };
};

const login = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find user
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate Token
  const token = jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '24h' }
  );

  // Return user info without password
  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};

module.exports = {
  register,
  login
};
