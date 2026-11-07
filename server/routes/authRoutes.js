import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
const router = Router();
const makeToken = user => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "dev_secret_change_me", { expiresIn: "7d" });
const safe = user => ({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: "Name, email and password (minimum 8 characters) are required" });
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), phone, address, role: "citizen" });
    res.status(201).json({ token: makeToken(user), user: safe(user) });
  } catch (e) { next(e); }
});
router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || "").toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ message: "Incorrect email or password" });
    if (!user.active) return res.status(403).json({ message: "Account disabled" });
    res.json({ token: makeToken(user), user: safe(user) });
  } catch (e) { next(e); }
});
router.get("/me", protect, (req, res) => res.json({ user: safe(req.user) }));
export default router;
