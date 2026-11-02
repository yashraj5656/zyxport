// components/Navbar.jsx
// NO "use client" here — this is a Server Component

import { getCurrentUser } from "@/lib/getCurrentUser";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const user = await getCurrentUser();
  return <NavbarClient user={user} />;
}