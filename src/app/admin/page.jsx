// app/admin/page.jsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import AdminClient from "./AdminClient";
import "./admin.css";

export const metadata = { title: "Admin — Zyxport" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();
  const doc = await User.findById(user.id).select("isAdmin").lean();
  if (!doc?.isAdmin) redirect("/");

  return (
    <main className="admin-page">
      <div className="admin-container">
        <AdminClient />
      </div>
    </main>
  );
}