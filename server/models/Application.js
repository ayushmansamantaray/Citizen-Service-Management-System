import mongoose from "mongoose";
const applicationSchema = new mongoose.Schema({
  applicationId: { type: String, unique: true },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  officer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  applicantName: { type: String, required: true },
  details: { type: String, default: "" },
  documents: [{ originalName: String, filename: String, path: String }],
  status: { type: String, enum: ["Submitted", "Under Review", "Document Required", "Approved", "Rejected", "Completed"], default: "Submitted" },
  remarks: { type: String, default: "" },
  history: [{ status: String, remarks: String, updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, date: { type: Date, default: Date.now } }]
}, { timestamps: true });
applicationSchema.pre("save", function(next) {
  if (!this.applicationId) this.applicationId = `CSMS-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random()*900)}`;
  next();
});
export default mongoose.model("Application", applicationSchema);
