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
  "bg-primary",
  "bg-emerald-400",
];

export default function StressTriggers({ triggers }: StressTriggersProps) {
  const sorted = [...triggers].sort((a, b) => b.count - a.count);

  return (
    <div
      id="stress-triggers-card"
      className="rounded-xl bg-surface-container border border-outline p-6 shadow-card"
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container shadow-sm">
          <AlertTriangle className="h-6 w-6 text-tertiary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Key Stress Triggers This Week
          </h2>
          <p className="text-xs text-on-surface-variant font-medium">
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
          <p className="text-3xl animate-bounce">🌟</p>
          <p className="mt-3 text-base font-bold text-foreground">
            No major stress triggers detected.
          </p>
          <p className="mt-1 text-xs text-on-surface-variant font-medium">
            Keep it up! You&apos;re managing well.
          </p>
        </div>
      ) : (
        <ul id="stress-triggers-list" className="space-y-2">
          {sorted.map((item, index) => (
            <li
              key={item.trigger}
              id={`stress-trigger-${index}`}
              className="group flex items-center justify-between rounded-2xl px-4 py-2.5 transition-md hover:bg-secondary-container/40 active-tactile cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${dotColors[index % dotColors.length]}`}
                />
                <span className="text-sm font-semibold text-foreground">
                  {item.trigger}
                </span>
              </div>

              <span className="rounded-full bg-secondary-container px-2.5 py-0.5 text-xs font-bold text-on-secondary-container">
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
