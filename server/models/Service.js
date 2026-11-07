import mongoose from "mongoose";
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  department: { type: String, default: "Citizen Services" },
  requiredDocuments: [{ type: String }],
  processingDays: { type: Number, default: 7 },
  fee: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model("Service", serviceSchema);
