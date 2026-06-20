"use client";

import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface MoodDataPoint {
  day: string;
  score: number;
  date: string;
}

interface EmotionalTimelineProps {
  data: MoodDataPoint[];
}

const emojiMap: Record<number, string> = {
  1: "😔",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😊",
};

const moodLabelMap: Record<number, string> = {
  1: "Rough",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: MoodDataPoint }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0];
  const score = dataPoint.value;
  const date = dataPoint.payload.date;

  return (
    <div
      id="emotional-timeline-tooltip"
      className="rounded-xl border border-white/20 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-xl"
    >
      <p className="text-xs font-medium text-slate-400">{date}</p>
      <p className="mt-1 text-lg font-semibold text-slate-800">
        {emojiMap[score] ?? "😐"} {moodLabelMap[score] ?? "Unknown"}
      </p>
      <p className="text-xs text-slate-500">
        {label} · Score {score}/5
      </p>
    </div>
  );
}

export default function EmotionalTimeline({ data }: EmotionalTimelineProps) {
  return (
    <div
      id="emotional-timeline-card"
      className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-md backdrop-blur-xl transition-shadow duration-300 hover:shadow-lg"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Weekly Emotional Pulse
          </h2>
          <p className="text-sm text-slate-400">
            Your mood trends over the past 7 days
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#e2e8f0"
            vertical={false}
          />

          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 13, fontWeight: 500 }}
            dy={8}
          />

          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => emojiMap[value] ?? ""}
            tick={{ fontSize: 16 }}
            dx={-4}
            width={40}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#818cf8", strokeWidth: 1, strokeDasharray: "4 4" }}
          />

          <Area
            type="monotone"
            dataKey="score"
            stroke="#818cf8"
            strokeWidth={3}
            fill="url(#moodGradient)"
            dot={{
              fill: "#ffffff",
              stroke: "#818cf8",
              strokeWidth: 2,
              r: 5,
            }}
            activeDot={{
              fill: "#818cf8",
              stroke: "#ffffff",
              strokeWidth: 2,
              r: 7,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
