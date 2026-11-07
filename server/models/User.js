import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  role: { type: String, enum: ["citizen", "officer", "admin"], default: "citizen" },
  active: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model("User", userSchema);
