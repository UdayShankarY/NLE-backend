import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../models/User";
import sendEmail from "../utils/sendEmail";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName || email.split("@")[0],
        lastName: user.lastName || "",
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
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export default { login };
