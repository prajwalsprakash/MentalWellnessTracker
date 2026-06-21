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
  className?: string;
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
      className="rounded-2xl border border-outline/10 bg-surface-container/95 px-4 py-3 shadow-md backdrop-blur-sm"
    >
      <p className="text-xs font-semibold text-on-surface-variant">{date}</p>
      <p className="mt-1 text-lg font-bold text-foreground">
        {emojiMap[score] ?? "😐"} {moodLabelMap[score] ?? "Unknown"}
      </p>
      <p className="text-xs font-medium text-on-surface-variant/75">
        {label} · Score {score}/5
      </p>
    </div>
  );
}

export default function EmotionalTimeline({ data, className = "" }: EmotionalTimelineProps) {
  return (
    <div
      id="emotional-timeline-card"
      className={`rounded-xl bg-surface-container border border-outline p-6 shadow-card flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container shadow-sm">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Weekly Emotional Pulse
          </h2>
          <p className="text-xs text-on-surface-variant font-medium">
            Your mood trends over the past 7 days
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="var(--outline)"
              strokeOpacity={0.15}
              vertical={false}
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--on-surface-variant)", fontSize: 12, fontWeight: 600 }}
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
              cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 4" }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={3}
              fill="url(#moodGradient)"
              dot={{
                fill: "#ffffff",
                stroke: "var(--primary)",
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{
                fill: "var(--primary)",
                stroke: "#ffffff",
                strokeWidth: 2,
                r: 7,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
