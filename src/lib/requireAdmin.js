// lib/requireAdmin.js
import { getAuthUser } from "./auth";
import dbConnect from "./mongodb";
import User from "@/models/User";

export async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth) return { error: "Not authenticated", status: 401 };

  await dbConnect();
  const user = await User.findById(auth.userId).select("isAdmin").lean();
  if (!user || !user.isAdmin) return { error: "Forbidden", status: 403 };

  return { user };
}