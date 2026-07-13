const sendEmail = require("../utils/sendEmail");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const { login } = require("../controllers/authController");
const User = require("../models/User");
const crypto = require('crypto');

// LOGIN ROUTE
router.post("/login", login);

// REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    // check user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = new User({
      firstName: req.body.firstName || email.split('@')[0],
      lastName: req.body.lastName || '',
      email,
      password: hashedPassword,
      role: "user"
    });

    await user.save();

    // Send response immediately
    res.json({ msg: "User registered successfully" });

    // Send email asynchronously (don't block response)
    sendEmail(
      email,
      "Welcome to TheDecorParty",
      `
<h2>🎉 Welcome to TheDecorParty</h2>

<p>Your account has been created successfully.</p>

<p><strong>Email:</strong> ${email}</p>

<h3>Our Services</h3>
<ul>
<li>Birthday Decorations</li>
<li>Anniversary Setups</li>
<li>Candle Light Dinners</li>
<li>Proposal Events</li>
</ul>

<p>We are excited to help you celebrate your special moments.</p>

<p>Regards,<br>TheDecorParty Team</p>
`
    ).catch(err => console.log('Email failed:', err.message));

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GOOGLE AUTH ROUTE
router.post("/google", async (req, res) => {
  try {
    const { uid, email, firstName, lastName, photoURL } = req.body;
    if (!email || !uid) return res.status(400).json({ msg: "Invalid Google data" });

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        email,
        googleId: uid,
        photoURL: photoURL || '',
        password: '',
        role: 'user'
      });
      await user.save();

      sendEmail(
        email,
        "Welcome to TheDecorParty",
        `
<h2>🎉 Welcome to TheDecorParty, ${firstName}!</h2>

<p>Your account has been created successfully via Google.</p>

<p><strong>Email:</strong> ${email}</p>

<h3>Our Services</h3>
<ul>
<li>Birthday Decorations</li>
<li>Anniversary Setups</li>
<li>Candle Light Dinners</li>
<li>Proposal Events</li>
</ul>

<p>We are excited to help you celebrate your special moments.</p>

<p>Regards,<br>TheDecorParty Team</p>
`
      ).catch(err => console.log('Email failed:', err.message));
    }

    const token = require('jsonwebtoken').sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.json({ msg: 'If an account exists, a password reset link has been sent to the email address' });
    }

    const user = await User.findOne({ email });

    // Always respond generically. If user exists, create token and email it.
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const hashed = crypto.createHash('sha256').update(token).digest('hex');

      user.resetPasswordToken = hashed;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
      await user.save();

      const frontendBase = process.env.FRONTEND_URL;
      const resetUrl = `${frontendBase.replace(/\/$/, '')}/reset-password/${token}`;

      const html = `
<p>You requested a password reset for your account at TheDecorParty.</p>
<p>Click the link below to reset your password. This link expires in 15 minutes.</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
`;

      sendEmail(user.email, 'Reset your TheDecorParty password', html).catch(err => console.error('Email failed:', err && err.message));
    }

    // Generic response
    return res.json({ msg: 'If an account exists, a password reset link has been sent to the email address' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// RESET PASSWORD
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body || {};
    if (!token || !password) return res.status(400).json({ msg: 'Invalid request' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    // Basic password validation
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    const newHashed = await bcrypt.hash(password, 10);
    user.password = newHashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;