import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Application from "../models/Application.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import { protect, allow } from "../middleware/auth.js";
import { notify } from "../utils/notify.js";
const router = Router();
const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  const ok = [".pdf", ".jpg", ".jpeg", ".png"].includes(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error("Only PDF, JPG and PNG files are allowed"), ok);
}});
router.post("/", protect, allow("citizen"), upload.array("documents", 5), async (req, res, next) => {
  try {
    const service = await Service.findById(req.body.service);
    if (!service || !service.active) return res.status(404).json({ message: "Service not found" });
    const docs = (req.files || []).map(f => ({ originalName: f.originalname, filename: f.filename, path: `/uploads/${f.filename}` }));
    const app = await Application.create({ citizen: req.user._id, service: service._id, applicantName: req.body.applicantName || req.user.name, details: req.body.details, documents: docs, history: [{ status: "Submitted", remarks: "Application submitted", updatedBy: req.user._id }] });
    res.status(201).json(await app.populate("service citizen", "name email"));
  } catch(e) { next(e); }
});
router.get("/my", protect, allow("citizen"), async (req, res, next) => {
  try { res.json(await Application.find({ citizen: req.user._id }).populate("service", "name department").populate("officer", "name").sort("-createdAt")); } catch(e) { next(e); }
});
router.get("/", protect, allow("officer", "admin"), async (req, res, next) => {
  try {
    const filter = req.user.role === "officer" ? { $or: [{ officer: req.user._id }, { officer: null }] } : {};
    res.json(await Application.find(filter).populate("citizen", "name email phone").populate("service", "name department").populate("officer", "name").sort("-createdAt"));
  } catch(e) { next(e); }
});
router.put("/:id/assign", protect, allow("admin"), async (req, res, next) => {
  try {
    const officer = await User.findOne({ _id: req.body.officerId, role: "officer", active: true });
    if (!officer) return res.status(400).json({ message: "Valid officer required" });
    const app = await Application.findByIdAndUpdate(req.params.id, { officer: officer._id }, { new: true }).populate("citizen service officer");
    if (!app) return res.status(404).json({ message: "Application not found" });
    await notify(officer._id, `Application ${app.applicationId} has been assigned to you.`, "/dashboard");
    res.json(app);
  } catch(e) { next(e); }
});
router.put("/:id/status", protect, allow("officer", "admin"), async (req, res, next) => {
  try {
    const { status, remarks = "" } = req.body;
    const valid = ["Under Review", "Document Required", "Approved", "Rejected", "Completed"];
    if (!valid.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (req.user.role === "officer" && app.officer && String(app.officer) !== String(req.user._id)) return res.status(403).json({ message: "This application is assigned to another officer" });
    if (req.user.role === "officer" && !app.officer) app.officer = req.user._id;
    app.status = status; app.remarks = remarks;
    app.history.push({ status, remarks, updatedBy: req.user._id });
    await app.save();
    await notify(app.citizen, `Your application ${app.applicationId} status is now: ${status}. ${remarks}`, "/dashboard");
    res.json(await app.populate("citizen service officer"));
  } catch(e) { next(e); }
});
export default router;
