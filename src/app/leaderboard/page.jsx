// app/leaderboard/page.jsx
import dbConnect from "@/lib/mongodb";
import Winner from "@/models/Winner";
import User from "@/models/User";
import Tournament from "@/models/Tournament";
import Link from "next/link";
import "./leaderboard.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leaderboard — Zyxport" };

export default async function LeaderboardPage() {
  await dbConnect();

  // 👇 Only fetch winners with valid user AND tournament refs
  const allWins = await Winner.find({
    user: { $ne: null },
    tournament: { $ne: null },
  }).lean();

  // 👇 Filter in JS too, in case some docs have undefined fields
  const validWins = allWins.filter(
    (w) =>
      w.user &&
      typeof w.user.toString === "function" &&
      w.tournament &&
      typeof w.tournament.toString === "function"
  );

  const userIds = [...new Set(validWins.map((w) => w.user.toString()))];
  const tournamentIds = [
    ...new Set(validWins.map((w) => w.tournament.toString())),
  ];

  const [users, tournaments] = await Promise.all([
    User.find({ _id: { $in: userIds } })
      .select("name email ign avatar")
      .lean(),
    Tournament.find({ _id: { $in: tournamentIds } })
      .select("name startTime")
      .lean(),
  ]);

  const userMap = Object.fromEntries(
    users.map((u) => [u._id.toString(), u])
  );
  const tournamentMap = Object.fromEntries(
    tournaments.map((t) => [t._id.toString(), t])
  );

  // Aggregate per user
  const playerStats = {};
  for (const win of validWins) {
    const uid = win.user.toString();
    if (!playerStats[uid]) {
      const u = userMap[uid];
      playerStats[uid] = {
        id: uid,
        name: u?.name || "Unknown",
        ign: u?.ign || "",
        avatar: u?.avatar || "",
        wins: 0,
        firstPlaces: 0,
        totalPrize: 0,
        totalEarnings: 0,
        totalKills: 0,
        tournaments: [],
      };
    }

    const p = playerStats[uid];
    p.wins += 1;
    if (win.rank === 1) p.firstPlaces += 1;
    p.totalPrize += win.prizeAmount || 0;
    if (win.paidToBank) p.totalEarnings += win.prizeAmount || 0;
    p.totalKills += win.kills || 0;

    const t = tournamentMap[win.tournament.toString()];
    p.tournaments.push({
      id: win.tournament.toString(),
      name: t?.name || "—",
      rank: win.rank,
      prize: win.prizeAmount,
      paid: win.paidToBank,
    });
  }

  const ranked = Object.values(playerStats).sort((a, b) => {
    if (b.totalEarnings !== a.totalEarnings) {
      return b.totalEarnings - a.totalEarnings;
    }
    if (b.firstPlaces !== a.firstPlaces) {
      return b.firstPlaces - a.firstPlaces;
    }
    return b.wins - a.wins;
  });

  function getInitials(name) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <main className="leaderboard-page">
      <div className="leaderboard-container">
        <header className="leaderboard-header">
          <span className="eyebrow">HALL OF CHAMPIONS</span>
          <h1>
            THE <span>LEADERBOARD</span>
          </h1>
          <p>Top players ranked by total winnings and tournament victories.</p>
        </header>

        {ranked.length === 0 ? (
          <div className="leaderboard-empty">
            <p>No winners yet. Check back after the first tournament ends!</p>
            <Link href="/tournaments" className="primary-button">
              Browse Tournaments →
            </Link>
          </div>
        ) : (
          <>
            {top3.length > 0 && (
              <section className="leaderboard-podium">
                {top3.map((player, idx) => {
                  const medal = ["🥇", "🥈", "🥉"][idx];
                  return (
                    <div
                      key={player.id}
                      className={`podium-card podium-rank-${idx + 1}`}
                    >
                      <div className="podium-avatar">
                        {player.avatar ? (
                          <span>{player.avatar}</span>
                        ) : (
                          getInitials(player.name)
                        )}
                      </div>

                      <div className="podium-info">
                        <strong className="podium-name">{player.name}</strong>
                        {player.ign && (
                          <span className="podium-ign">@{player.ign}</span>
                        )}
                        <span className="podium-meta">
                          ₹{player.totalEarnings.toLocaleString("en-IN")} ·{" "}
                          {player.firstPlaces} 🥇
                        </span>
                      </div>

                      <div className="podium-medal">{medal}</div>
                    </div>
                  );
                })}
              </section>
            )}

            {rest.length > 0 && (
              <section className="leaderboard-table-wrap">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Wins</th>
                      <th>1st Places</th>
                      <th>Kills</th>
                      <th>Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((player, idx) => (
                      <tr key={player.id}>
                        <td className="lb-rank">#{idx + 4}</td>
                        <td>
                          <div className="lb-player">
                            <div className="lb-avatar">
                              {player.avatar ? (
                                <span>{player.avatar}</span>
                              ) : (
                                getInitials(player.name)
                              )}
                            </div>
                            <div>
                              <strong>{player.name}</strong>
                              {player.ign && (
                                <small>@{player.ign}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{player.wins}</td>
                        <td>{player.firstPlaces}</td>
                        <td>{player.totalKills}</td>
                        <td className="lb-earnings">
                          ₹{player.totalEarnings.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <section className="leaderboard-summary">
              <div>
                <small>Total Players Ranked</small>
                <strong>{ranked.length}</strong>
              </div>
              <div>
                <small>Total Prize Distributed</small>
                <strong>
                  ₹
                  {ranked
                    .reduce((sum, p) => sum + p.totalEarnings, 0)
                    .toLocaleString("en-IN")}
                </strong>
              </div>
              <div>
                <small>Total Tournaments Won</small>
                <strong>
                  {ranked.reduce((sum, p) => sum + p.firstPlaces, 0)}
                </strong>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}