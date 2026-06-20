import { AlertTriangle } from "lucide-react";

interface StressTrigger {
  trigger: string;
  count: number;
}

interface StressTriggersProps {
  triggers: StressTrigger[];
}

const dotColors = [
  "bg-rose-400",
  "bg-amber-400",
  "bg-indigo-400",
  "bg-emerald-400",
];

export default function StressTriggers({ triggers }: StressTriggersProps) {
  const sorted = [...triggers].sort((a, b) => b.count - a.count);

  return (
    <div
      id="stress-triggers-card"
      className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-md backdrop-blur-xl transition-shadow duration-300 hover:shadow-lg"
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Key Stress Triggers This Week
          </h2>
          <p className="text-sm text-slate-400">
            Patterns to be mindful of
          </p>
        </div>
      </div>

      {/* Trigger list */}
      {sorted.length === 0 ? (
        <div
          id="stress-triggers-empty"
          className="flex flex-col items-center justify-center py-8 text-center"
        >
          <p className="text-3xl">🌟</p>
          <p className="mt-3 text-base font-medium text-slate-700">
            No major stress triggers detected.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Keep it up! You&apos;re managing well.
          </p>
        </div>
      ) : (
        <ul id="stress-triggers-list" className="space-y-2">
          {sorted.map((item, index) => (
            <li
              key={item.trigger}
              id={`stress-trigger-${index}`}
              className="group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 hover:bg-slate-50/80"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${dotColors[index % dotColors.length]}`}
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                  {item.trigger}
                </span>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
