// app/api/profile/route.js
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(req) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const updates = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (name.length < 2) {
        return Response.json(
          { error: "Name must be at least 2 characters" },
          { status: 400 }
        );
      }
      updates.name = name;
    }

    if (typeof body.ign === "string") {
      updates.ign = body.ign.trim().slice(0, 32);
    }

    if (typeof body.bio === "string") {
      updates.bio = body.bio.trim().slice(0, 280);
    }

    if (typeof body.avatar === "string") {
      updates.avatar = body.avatar.trim().slice(0, 4);
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No valid fields" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findByIdAndUpdate(auth.userId, updates, {
      new: true,
    }).lean();

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        ign: user.ign,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}