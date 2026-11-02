// app/profile/page.jsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import dbConnect from "@/lib/mongodb";
import Winner from "@/models/Winner";
import BankDetail from "@/models/BankDetail";
import ProfileClient from "./ProfileClient";
import "./profile.css";

export const metadata = { title: "My Profile — Zyxport" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();

  const [wins, bank] = await Promise.all([
    Winner.find({ user: user.id }).sort({ createdAt: -1 }).lean(),
    BankDetail.findOne({ user: user.id }).lean(),
  ]);

  const stats = {
    wins: wins.length,
    firstPlaces: wins.filter((w) => w.rank === 1).length,
    totalPrize: wins.reduce((sum, w) => sum + (w.prizeAmount || 0), 0),
    totalEarnings: wins
      .filter((w) => w.paidToBank)
      .reduce((sum, w) => sum + (w.prizeAmount || 0), 0),
    pendingPayout: wins
      .filter((w) => !w.paidToBank)
      .reduce((sum, w) => sum + (w.prizeAmount || 0), 0),
    totalKills: wins.reduce((sum, w) => sum + (w.kills || 0), 0),
  };

  const serializedWins = wins.map((w) => ({
    id: w._id.toString(),
    rank: w.rank,
    prizeAmount: w.prizeAmount,
    kills: w.kills,
    paidToBank: w.paidToBank,
    paidAt: w.paidAt?.toISOString() || null,
    createdAt: w.createdAt?.toISOString(),
  }));

  const serializedBank = bank
    ? {
        accountHolderName: bank.accountHolderName,
        accountNumber: bank.accountNumber,
        ifscCode: bank.ifscCode,
        bankName: bank.bankName,
        upiId: bank.upiId,
      }
    : null;

  return (
    <main className="profile-page">
      <div className="profile-container">
        <ProfileClient
          user={user}
          stats={stats}
          wins={serializedWins}
          initialBank={serializedBank}
        />
      </div>
    </main>
  );
}