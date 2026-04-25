const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  photoURL: String,
  role: {
    type: String,
    default: "user"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);