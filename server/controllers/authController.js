const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadBuffer } = require('../services/cloudinaryService');

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({ name, email, password });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  res
    .cookie('refreshToken', refreshToken, cookieOptions)
    .status(201)
    .json(new ApiResponse(201, { user: user.toSafeObject(), accessToken }, 'Account created successfully'));
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  res
    .cookie('refreshToken', refreshToken, cookieOptions)
    .status(200)
    .json(new ApiResponse(200, { user: user.toSafeObject(), accessToken }, 'Logged in successfully'));
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  res.clearCookie('refreshToken', cookieOptions);
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user.toSafeObject() }));
});

// PUT /api/auth/update
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, theme, defaultNoteColor } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name, bio, theme, defaultNoteColor } },
    { new: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, 'Profile updated'));
});

// PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

// POST /api/auth/upload-avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided');

  const result = await uploadBuffer(req.file.buffer, 'notes-app/avatars');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePic: result.secure_url },
    { new: true }
  );

  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, 'Avatar uploaded'));
});

// POST /api/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token provided');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Refresh token does not match');
  }

  const accessToken = generateAccessToken(user._id);
  res.status(200).json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  refreshToken,
};
