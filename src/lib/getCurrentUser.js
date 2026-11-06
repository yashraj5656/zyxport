// lib/getCurrentUser.js
import { getAuthUser } from "./auth";
import dbConnect from "./mongodb";
import User from "@/models/User";

export async function getCurrentUser() {
  try {
    const auth = await getAuthUser();
    if (!auth) return null;

    await dbConnect();
    const doc = await User.findById(auth.userId).lean();
    if (!doc) return null;

    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      ign: doc.ign || "",
      bio: doc.bio || "",
      avatar: doc.avatar || "",
      isAdmin: doc.isAdmin || false,  
      isOrganizer: doc.isOrganizer === true,
      subscriptionExpiry: doc.subscriptionExpiry ? doc.subscriptionExpiry.toISOString() : null,
      createdAt: doc.createdAt
        ? doc.createdAt.toISOString()
        : new Date().toISOString(),
    };
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}