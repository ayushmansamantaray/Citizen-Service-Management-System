import { Router } from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.get("/", protect, async (req, res, next) => {
  try { res.json(await Notification.find({ user: req.user._id }).sort("-createdAt").limit(30)); } catch(e) { next(e); }
});
router.put("/:id/read", protect, async (req, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
    if (!n) return res.status(404).json({message:"Notification not found"});
    res.json(n);
  } catch(e) { next(e); }
});
export default router;
