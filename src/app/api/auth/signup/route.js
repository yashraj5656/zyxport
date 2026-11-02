import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    await dbConnect();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      // generic message to prevent email enumeration [citation:3]
      return Response.json(
        { error: "Invalid registration details" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
    });

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    await setAuthCookie(token);

    return Response.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}