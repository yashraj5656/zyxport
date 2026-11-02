import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = "token";

// ---- Password ----
export async function hashPassword(password) {
  return bcrypt.hash(password, 12); // 12 rounds, security/performance balance [citation:5]
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ---- JWT ----
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// ---- Cookie ----
export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,                // prevents XSS from reading the token [citation:3]
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",               // basic CSRF protection [citation:3]
    path: "/",
    maxAge: 60 * 60 * 24 * 7,      // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}