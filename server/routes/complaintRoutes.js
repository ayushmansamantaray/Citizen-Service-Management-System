import { Router } from "express";
import Complaint from "../models/Complaint.js";
import { protect, allow } from "../middleware/auth.js";
import { notify } from "../utils/notify.js";
const router = Router();
router.post("/", protect, allow("citizen"), async (req, res, next) => {
  try {
    const { subject, description, category } = req.body;
    if (!subject || !description) return res.status(400).json({ message: "Subject and description are required" });
    res.status(201).json(await Complaint.create({ citizen: req.user._id, subject, description, category }));
  } catch(e) { next(e); }
});
router.get("/my", protect, allow("citizen"), async (req, res, next) => {
  try { res.json(await Complaint.find({ citizen: req.user._id }).sort("-createdAt")); } catch(e) { next(e); }
});
router.get("/", protect, allow("officer", "admin"), async (_req, res, next) => {
  try { res.json(await Complaint.find().populate("citizen", "name email").sort("-createdAt")); } catch(e) { next(e); }
});
router.put("/:id", protect, allow("officer", "admin"), async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status, response: req.body.response || "" }, { new: true }).populate("citizen", "name");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    await notify(complaint.citizen._id, `Complaint ${complaint.complaintId} updated: ${complaint.status}. ${complaint.response}`, "/dashboard");
    res.json(complaint);
  } catch(e) { next(e); }
});
export default router;
