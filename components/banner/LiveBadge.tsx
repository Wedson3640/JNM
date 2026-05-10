"use client";

import { useEffect, useState } from "react";

interface Props {
  date: string; // "09/05/2026"
  time: string; // "15h40"
}

function checkIsLive(date: string, time: string): boolean {
  try {
    const [day, month, year] = date.split("/").map(Number);
    const [hours, minutes] = time.split("h").map(Number);
    const start = new Date(year, month - 1, day, hours, minutes);
    const end = new Date(start.getTime() + 50 * 60 * 1000);
    const now = new Date();
    return now >= start && now <= end;
  } catch {
    return false;
  }
}

export function LiveBadge({ date, time }: Props) {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const check = () => setIsLive(checkIsLive(date, time));
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [date, time]);

  if (!isLive) return null;

  return (
    <span className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
      <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true" />
      AO VIVO
    </span>
  );
}
