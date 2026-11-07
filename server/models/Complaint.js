import mongoose from "mongoose";
const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: "General" },
  status: { type: String, enum: ["Open", "In Progress", "Resolved", "Closed"], default: "Open" },
  response: { type: String, default: "" }
}, { timestamps: true });
complaintSchema.pre("save", function(next) {
  if (!this.complaintId) this.complaintId = `CMP-${Date.now().toString().slice(-8)}`;
  next();
});
export default mongoose.model("Complaint", complaintSchema);
