import jwt from "jsonwebtoken";
import User from "../models/User.js";
export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ") && req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");
    const user = await User.findById(decoded.id);
    if (!user || !user.active) return res.status(401).json({ message: "Account unavailable" });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: "Invalid or expired token" }); }
}
export const allow = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: "You do not have permission" });
  next();
};
