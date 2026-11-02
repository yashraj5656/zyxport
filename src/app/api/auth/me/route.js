import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return Response.json({ user: null }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(auth.userId).lean();

  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({
    user: { id: user._id, name: user.name, email: user.email },
  });
}