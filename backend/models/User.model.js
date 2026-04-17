const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String },
    role: { type: String, enum: ["user", "doctor", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    profilePic: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const bcrypt = require("bcryptjs");
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
