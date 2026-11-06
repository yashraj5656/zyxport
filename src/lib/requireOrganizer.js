// lib/requireOrganizer.js
import { getAuthUser } from "./auth";
import dbConnect from "./mongodb";
import User from "@/models/User";

export async function requireOrganizer() {
  const auth = await getAuthUser();
  if (!auth) return { error: "Not authenticated", status: 401 };

  await dbConnect();
  const user = await User.findById(auth.userId)
    .select("isAdmin isOrganizer subscriptionExpiry")
    .lean();

  if (!user) return { error: "User not found", status: 404 };

  // Admins bypass subscription checks
  if (user.isAdmin) return { user };

  // Check if organizer and subscription is active
  const isExpired = user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date();

  if (!user.isOrganizer || isExpired) {
    return { error: "Subscription required or expired. Please renew.", status: 403 };
  }

  return { user };
}