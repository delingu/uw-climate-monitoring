// maps time-range dropdown value to a query window and an x-axis bucket

const DAY = 24 * 60 * 60;

export type Bucket = "hour" | "day" | "month";

interface RangeConfig {
  // seconds to look back; null means from the epoch (all time)
  windowSeconds: number | null;
  bucket: Bucket;
}

export const RANGE_CONFIG: Record<string, RangeConfig> = {
  "24H": { windowSeconds: DAY, bucket: "hour" },
  Weekly: { windowSeconds: 7 * DAY, bucket: "day" },
  Monthly: { windowSeconds: 30 * DAY, bucket: "day" },
  Yearly: { windowSeconds: 365 * DAY, bucket: "month" },
  "All time": { windowSeconds: null, bucket: "month" },
};

// timeStart/timeEnd and bucket for a given range value.
export function rangeQuery(timeRange: string) {
  const config = RANGE_CONFIG[timeRange] ?? RANGE_CONFIG["24H"];
  const now = Math.floor(Date.now() / 1000);

  return {
    timeStart: config.windowSeconds === null ? 0 : now - config.windowSeconds,
    timeEnd: now,
    bucket: config.bucket,
  };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function monthName(monthIndex1: number): string {
  return MONTHS[monthIndex1 - 1] ?? "";
}

// Formats an strftime bucket key from /api/trends into an axis label.
export function bucketLabel(bucket: string, granularity: Bucket): string {
  if (granularity === "hour") {
    // "2026-07-24 15:00"
    const hour = Number(bucket.slice(11, 13));
    const suffix = hour < 12 ? "AM" : "PM";
    const twelve = hour % 12 === 0 ? 12 : hour % 12;
    return `${twelve}${suffix}`;
  }

  if (granularity === "month") {
    // "2026-07"
    return monthName(Number(bucket.slice(5, 7)));
  }

  // day: "2026-07-24"
  return `${monthName(Number(bucket.slice(5, 7)))} ${Number(bucket.slice(8, 10))}`;
}
