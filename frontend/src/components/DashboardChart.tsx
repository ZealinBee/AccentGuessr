import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "../scss/DashboardChart.scss";

type Round = {
  id: number;
  score: number;
  guessLat?: number;
  guessLong?: number;
  speakerId?: number;
};

type Game = {
  id: number;
  totalScore?: number;
  rounds: Round[];
  createdAt?: string;
};

type Props = {
  game?: Game | null;
  // optionally accept rounds directly
  rounds?: Round[];
  // accept array of games to plot totalScore across games
  games?: Game[] | null;
  height?: number;
};

function DashboardChart({ game, rounds, games, height = 200 }: Props) {
  // support two modes:
  // - games prop provided => plot totalScore per game
  // - otherwise fall back to plotting rounds (existing behavior)
  const dataFromRounds = (rounds ?? game?.rounds ?? []).map((r, i) => ({
    name: `#${i + 1}`,
    score: typeof r.score === "number" ? r.score : 0,
  }));

  let data = dataFromRounds;
  let header = "Round scores";

  if (games && Array.isArray(games) && games.length > 0) {
    data = games.map((g, i) => ({
      name: g.createdAt ? new Date(g.createdAt).toLocaleDateString() : `#${i + 1}`,
      score: typeof g.totalScore === "number" ? g.totalScore : 0,
    }));
    header = "Total score per game";
  }

  return (
    <div className="dashboard-chart">
      <div className="chart-header">{header}</div>
      <div className="chart-wrapper" style={{ height }}>
        {data.length === 0 ? (
          <div className="no-data">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#cbd5e1' }}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#cbd5e1' }}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: '#3b82f6',
                  stroke: '#1e40af',
                  strokeWidth: 2
                }}
                activeDot={{
                  r: 7,
                  fill: '#60a5fa',
                  stroke: '#1e40af',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default DashboardChart;