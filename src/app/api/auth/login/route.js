import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    await setAuthCookie(token);

    return Response.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);   // 👈 THIS prints the real cause
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}