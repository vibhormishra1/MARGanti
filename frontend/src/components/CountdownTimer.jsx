// REQ-M1-03: NO setInterval(). Timer only updates when Firebase pushes new state.
// Color shifts as time drops — purely visual urgency cue.

import { useMemo } from "react";

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  // :00 is cosmetic — makes it look like a real countdown
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export default function CountdownTimer({ timeRemaining }) {
  const isCritical = timeRemaining <= 60;
  const isWarning  = timeRemaining <= 120;

  const colorClass = useMemo(() => {
    if (isCritical) return "text-red-400 animate-pulse";
    if (isWarning)  return "text-amber-400";
    return "text-green-400";
  }, [isCritical, isWarning]);

  return (
    <div className="flex flex-col items-end">
      <span className="text-xs text-gray-500 uppercase tracking-wider">
        Time Until Spoilage
      </span>
      <span className={`font-mono font-bold text-2xl ${colorClass}`}>
        {formatTime(timeRemaining)}
      </span>
      {isCritical && (
        <span className="text-xs text-red-500 font-bold animate-pulse">
          ⚠ CRITICAL — SUPPLIES AT RISK
        </span>
      )}
    </div>
  );
}
