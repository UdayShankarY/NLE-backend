const sendEmail = require("../utils/sendEmail");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const { login } = require("../controllers/authController");
const User = require("../models/User");

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

module.exports = router;