// app/organizer/page.jsx
import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/requireOrganizer";
import OrganizerClient from "./OrganizerClient";
import "./organizer.css";

export const metadata = { title: "Organizer Dashboard — ZYXPORT" };
export const dynamic = "force-dynamic";

export default async function OrganizerPage() {
  const guard = await requireOrganizer();
  
  // If they aren't logged in, go to login
  if (guard.status === 401) redirect("/login");
  
  // If they are logged in but don't have an active subscription, go to pricing
  if (guard.status === 403) redirect("/organizers#pricing");

  return (
    <main className="admin-page">
      <div className="admin-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 className="admin-title">Organizer Dashboard</h1>
          <div style={{ textAlign: "right" }}>
            <span className="reg-badge reg-badge-paid">PRO MEMBER</span>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              Expires: {new Date(guard.user.subscriptionExpiry).toLocaleDateString()}
            </div>
          </div>
        </div>
        <OrganizerClient />
      </div>
    </main>
  );
}