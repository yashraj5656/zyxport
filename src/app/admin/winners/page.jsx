// app/admin/winners/page.jsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import WinnersClient from "./WinnersClient";
import "../admin.css";
import "./winners.css";

export const metadata = { title: "Winners & Payouts — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminWinnersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();
  const doc = await User.findById(user.id).select("isAdmin").lean();
  if (!doc?.isAdmin) redirect("/");

  return (
    <main className="admin-page">
      <div className="admin-container">
        <WinnersClient />
      </div>
    </main>
  );
}