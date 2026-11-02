import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import MessagesClient from "./MessagesClient";
import "../admin.css";

export const metadata = { title: "Messages — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();
  const doc = await User.findById(user.id).select("isAdmin").lean();
  if (!doc?.isAdmin) redirect("/");

  return (
    <main className="admin-page">
      <div className="admin-container">
        <MessagesClient />
      </div>
    </main>
  );
}