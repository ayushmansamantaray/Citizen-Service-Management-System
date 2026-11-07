import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Service from "./models/Service.js";
dotenv.config();
await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/csms");
const password = await bcrypt.hash("Password123!", 12);
for (const u of [
  { name: "CSMS Administrator", email: "admin@csms.local", role: "admin" },
  { name: "Demo Officer", email: "officer@csms.local", role: "officer" },
  { name: "Demo Citizen", email: "citizen@csms.local", role: "citizen", phone: "9000000000", address: "Demo Address, India" }
]) await User.updateOne({ email: u.email }, { $set: { ...u, password, active: true } }, { upsert: true });
const services = [
  { name: "Income Certificate", description: "Apply for an income certificate for education, welfare and other official purposes.", department: "Revenue Department", requiredDocuments: ["Identity proof", "Income proof", "Address proof"], processingDays: 7, fee: 0 },
  { name: "Residence Certificate", description: "Request an official certificate confirming your residential address.", department: "Revenue Department", requiredDocuments: ["Identity proof", "Address proof"], processingDays: 7, fee: 0 },
  { name: "Caste Certificate", description: "Submit an application for a caste certificate.", department: "Revenue Department", requiredDocuments: ["Identity proof", "Address proof", "Supporting community document"], processingDays: 15, fee: 0 },
  { name: "Birth Certificate", description: "Request a birth certificate record or correction.", department: "Municipal Services", requiredDocuments: ["Hospital record", "Parent identity proof"], processingDays: 10, fee: 0 },
  { name: "Trade License", description: "Apply for a local trade license.", department: "Municipal Services", requiredDocuments: ["Identity proof", "Business address proof"], processingDays: 15, fee: 100 }
];
for (const s of services) await Service.updateOne({ name: s.name }, { $set: s }, { upsert: true });
console.log("Seed complete. Demo password for all accounts: Password123!");
await mongoose.disconnect();
