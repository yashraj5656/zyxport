// app/admin/registrations/page.jsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import RegistrationsClient from "./RegistrationsClient";
import "../admin.css";
import "./registrations.css";

export const metadata = { title: "Registrations — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();
  const doc = await User.findById(user.id).select("isAdmin").lean();
  if (!doc?.isAdmin) redirect("/");

  return (
    <main className="admin-page">
      <div className="admin-container">
        <RegistrationsClient />
      </div>
    </main>
  );
}