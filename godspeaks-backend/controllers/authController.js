const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const { sendEmail } = require('../services/emailService');

// ===============================
// TOKEN
// ===============================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ===============================
// REGISTER + EMAIL VERIFICATION
// ===============================
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists =
    (await Customer.findOne({ email })) ||
    (await Admin.findOne({ email }));

  if (exists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const customer = await Customer.create({
    name,
    email,
    password,
    emailVerificationToken: crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex'),
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  await sendEmail({
    to: customer.email,
    subject: 'Verify your email',
    html: `
      <h3>Welcome to GodSpeaks 🙏</h3>
      <p>Please verify your email:</p>
      <a href="${verifyUrl}">Verify Email</a>
    `,
  });

  res.status(201).json({
    _id: customer._id,
    email: customer.email,
    role: customer.role,
    token: generateToken(customer._id),
  });
});

// ===============================
// LOGIN
// ===============================
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (admin && (await admin.matchPassword(password))) {
    return res.json({
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  }

  const customer = await Customer.findOne({ email });
  if (customer && (await customer.matchPassword(password))) {
    return res.json({
      _id: customer._id,
      email: customer.email,
      role: customer.role,
      token: generateToken(customer._id),
    });
  }

  res.status(401);
  throw new Error('Invalid credentials');
});

// ===============================
// FORGOT PASSWORD
// ===============================
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user =
    (await Customer.findOne({ email })) ||
    (await Admin.findOne({ email }));

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset',
    html: `
      <p>Reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>Valid for 15 minutes</p>
    `,
  });

  res.json({ message: 'Reset email sent' });
});

// ===============================
// RESET PASSWORD
// ===============================
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user =
    (await Customer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })) ||
    (await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }));

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: 'Password updated successfully' });
});

// ===============================
// VERIFY EMAIL
// ===============================
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await Customer.findOne({
    emailVerificationToken: hashedToken,
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;

  await user.save();

  res.json({ message: 'Email verified successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
