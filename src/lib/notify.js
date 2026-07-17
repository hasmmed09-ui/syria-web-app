import { base44 } from "@/api/base44Client";

export async function createNotification({ user_id, title, body, type = "info", request_id }) {
  if (!user_id) return;
  try {
    await base44.entities.Notification.create({
      user_id,
      title,
      body,
      type,
      request_id,
      read: false,
    });
  } catch {}
}

export async function sendEmailSafe(to, subject, body) {
  if (!to) return;
  try {
    await base44.integrations.Core.SendEmail({ to, subject, body });
  } catch {}
}

export async function getUserEmailSafe(userId) {
  if (!userId) return "";
  try {
    const u = await base44.entities.User.get(userId);
    return u?.email || "";
  } catch {
    return "";
  }
}