// app/tournaments/[id]/page.jsx
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Registration from "@/models/Registration";
import { getAuthUser } from "@/lib/auth";
import TournamentDetailClient from "./TournamentDetailClient";
import "./detail.css";

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({ params }) {
  const { id } = await params;

  let tournament = null;
  let registration = null;
  let isLoggedIn = false;

  try {
    await dbConnect();
    tournament = await Tournament.findById(id)
      .select("-roomId -roomPassword")
      .lean();

    if (tournament) {
      const auth = await getAuthUser();
      isLoggedIn = !!auth;

      if (auth) {
        registration = await Registration.findOne({
          user: auth.userId,
          tournament: id,
        }).lean();
      }
    }
  } catch {
    tournament = null;
  }

  if (!tournament) redirect("/tournaments");

  const t = {
    id: tournament._id.toString(),
    name: tournament.name,
    mode: tournament.mode,
    map: tournament.map,
    prize: tournament.prize,
    slots: tournament.slots,
    filled: tournament.filled,
    date: tournament.date,
    startTime: tournament.startTime?.toISOString() || null,
    status: tournament.status,
    color: tournament.color,
  };

  return (
    <main className="section" style={{ minHeight: "70vh" }}>
      <div className="section-container">
        <TournamentDetailClient
          tournament={t}
          isLoggedIn={isLoggedIn}
          isRegistered={registration?.paymentStatus === "paid"}
          registrationId={registration?._id?.toString() || null}
        />
      </div>
    </main>
  );
}