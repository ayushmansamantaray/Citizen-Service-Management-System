import { Router } from "express";
import Service from "../models/Service.js";
import { protect, allow } from "../middleware/auth.js";
const router = Router();
router.get("/", async (_req, res, next) => {
  try { res.json(await Service.find({ active: true }).sort("name")); } catch(e) { next(e); }
});
router.post("/", protect, allow("admin"), async (req, res, next) => {
  try { const service = await Service.create(req.body); res.status(201).json(service); } catch(e) { next(e); }
});
router.put("/:id", protect, allow("admin"), async (req, res, next) => {
  try { const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!service) return res.status(404).json({message:"Service not found"}); res.json(service); } catch(e) { next(e); }
});
router.delete("/:id", protect, allow("admin"), async (req, res, next) => {
  try { const service = await Service.findByIdAndUpdate(req.params.id, { active: false }, { new: true }); if (!service) return res.status(404).json({message:"Service not found"}); res.json({message:"Service deactivated"}); } catch(e) { next(e); }
});
export default router;
