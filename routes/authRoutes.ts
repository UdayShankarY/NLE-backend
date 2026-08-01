import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import sendEmail from "../utils/sendEmail";
import User from "../models/User";
import { login } from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

const profileFields = [
  "firstName", "lastName", "phone", "gender", "dateOfBirth",
  "address", "city", "state", "country", "pincode", "photoURL",
] as const;

function publicUser(user: any) {
  const email = typeof user.email === 'string' ? user.email.trim() : '';
  const firstName = typeof user.firstName === 'string' ? user.firstName.trim() : '';
  const lastName = typeof user.lastName === 'string' ? user.lastName.trim() : '';
  const photoURL = typeof user.photoURL === 'string' ? user.photoURL.trim() : '';

  return {
    id: String(user._id),
    email,
    role: typeof user.role === 'string' ? user.role : 'user',
    name: [firstName, lastName].filter(Boolean).join(' ') || email,
    avatar: photoURL,
    photoURL,
    firstName,
    lastName,
    phone: typeof user.phone === 'string' ? user.phone.trim() : '',
    gender: typeof user.gender === 'string' ? user.gender.trim() : '',
    dateOfBirth: typeof user.dateOfBirth === 'string' ? user.dateOfBirth.trim() : '',
    address: typeof user.address === 'string' ? user.address.trim() : '',
    city: typeof user.city === 'string' ? user.city.trim() : '',
    state: typeof user.state === 'string' ? user.state.trim() : '',
    country: typeof user.country === 'string' ? user.country.trim() : '',
    pincode: typeof user.pincode === 'string' ? user.pincode.trim() : '',
  };
}

router.post("/login", login);

router.get("/profile", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id?: string } }).user?.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ msg: "Failed to load profile" });
  }
});

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id?: string } }).user?.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ msg: "Failed to load current user" });
  }
});

router.put("/profile", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id?: string } }).user?.id;
    const updates = profileFields.reduce((values, field) => {
      if (field in req.body && typeof req.body[field] === "string") values[field] = req.body[field].trim();
      return values;
    }, {} as Record<string, string>);
    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ msg: "Failed to save profile" });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName: req.body.firstName || email.split("@")[0],
      lastName: req.body.lastName || "",
      email,
      password: hashedPassword,
      role: "user",
      phone: req.body.phone || "",
    });

    await user.save();

    res.json({ msg: "User registered successfully" });

    sendEmail(
      email,
      "Welcome to TheDecorParty",
      `
<h2>🎉 Welcome to TheDecorParty</h2>
<p>Your account has been created successfully.</p>
<p><strong>Email:</strong> ${email}</p>
<ul>
  <li>Birthday Decorations</li>
  <li>Anniversary Setups</li>
  <li>Candle Light Dinners</li>
  <li>Proposal Events</li>
</ul>
<p>We are excited to help you celebrate your special moments.</p>
<p>Regards,<br>TheDecorParty Team</p>
`
    ).catch((err: Error) => console.log("Email failed:", err.message));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/google", async (req: Request, res: Response) => {
  try {
    const { uid, email, firstName, lastName, photoURL } = req.body;
    if (!email || !uid) return res.status(400).json({ msg: "Invalid Google data" });

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        firstName: firstName || email.split("@")[0],
        lastName: lastName || "",
        email,
        googleId: uid,
        photoURL: photoURL || "",
        password: "",
        role: "user",
      });
      await user.save();

      sendEmail(
        email,
        "Welcome to TheDecorParty",
        `
<h2>🎉 Welcome to TheDecorParty, ${firstName}!</h2>
<p>Your account has been created successfully via Google.</p>
<p><strong>Email:</strong> ${email}</p>
<ul>
  <li>Birthday Decorations</li>
  <li>Anniversary Setups</li>
  <li>Candle Light Dinners</li>
  <li>Proposal Events</li>
</ul>
<p>We are excited to help you celebrate your special moments.</p>
<p>Regards,<br>TheDecorParty Team</p>
`
      ).catch((err: Error) => console.log("Email failed:", err.message));
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: String(user._id),
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        pincode: user.pincode || "",
        photoURL: user.photoURL || "",
        avatar: user.photoURL || "",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.json({ msg: "If an account exists, a password reset link has been sent to the email address" });
    }

    const user = await User.findOne({ email });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenValue = typeof token === "string" ? token : token[0];
      const hashed = crypto.createHash("sha256").update(tokenValue).digest("hex");

      user.resetPasswordToken = hashed;
      user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetUrl = `${frontendBase.replace(/\/$/, "")}/reset-password/${token}`;

      const html = `
<p>You requested a password reset for your account at TheDecorParty.</p>
<p>Click the link below to reset your password. This link expires in 15 minutes.</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
`;

      const destinationEmail = typeof user.email === "string" ? user.email : "";
      sendEmail(destinationEmail, "Reset your TheDecorParty password", html).catch((err: Error) => console.error("Email failed:", err && err.message));
    }

    return res.json({ msg: "If an account exists, a password reset link has been sent to the email address" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/reset-password/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body || {};
    if (!token || !password) return res.status(400).json({ msg: "Invalid request" });

    const tokenValue = typeof token === "string" ? token : token[0];
    const hashed = crypto.createHash("sha256").update(tokenValue).digest("hex");

    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    const newHashed = await bcrypt.hash(password, 10);
    user.password = newHashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;
