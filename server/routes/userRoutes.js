import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Application from "../models/Application.js";
import Complaint from "../models/Complaint.js";
import { protect, allow } from "../middleware/auth.js";
const router = Router();
router.get("/officers", protect, allow("admin"), async (_req, res, next) => {
  try { res.json(await User.find({ role: "officer", active: true }).select("name email")); } catch(e) { next(e); }
});
router.post("/officers", protect, allow("admin"), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) return res.status(400).json({message:"Name, email and password (minimum 8 characters) are required"});
    if (await User.findOne({ email })) return res.status(409).json({message:"Email already exists"});
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: "officer" });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch(e) { next(e); }
});
router.get("/stats", protect, allow("admin", "officer"), async (_req, res, next) => {
  try {
    const [applications, complaints, citizens, pending, approved] = await Promise.all([
      Application.countDocuments(), Complaint.countDocuments(), User.countDocuments({role:"citizen"}),
      Application.countDocuments({status:{$in:["Submitted","Under Review","Document Required"]}}),
      Application.countDocuments({status:{$in:["Approved","Completed"]}})
    ]);
    res.json({ applications, complaints, citizens, pending, approved });
  } catch(e) { next(e); }
});
export default router;
