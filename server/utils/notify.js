import Notification from "../models/Notification.js";
export async function notify(user, message, link = "") {
  if (user) await Notification.create({ user, message, link });
}
