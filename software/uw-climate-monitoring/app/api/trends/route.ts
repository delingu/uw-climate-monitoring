import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// whitelisted strftime formats so no sql injection basically lol
const BUCKET_FORMATS: Record<string, string> = {
  hour: "%Y-%m-%d %H:00",
  day: "%Y-%m-%d",
  month: "%Y-%m",
};

// time-bucketed sensor averages for one room, for the Data & Trends charts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeStart = searchParams.get("timeStart");
  const timeEnd = searchParams.get("timeEnd");
  const location = searchParams.get("location");
  const bucket = searchParams.get("bucket") ?? "day";

  if (!timeStart || !timeEnd || !location) {
    return NextResponse.json(
      { error: "Missing time/location query params" },
      { status: 400 },
    );
  }

  const format = BUCKET_FORMATS[bucket];
  if (!format) {
    return NextResponse.json(
      { error: "Invalid bucket (hour | day | month)" },
      { status: 400 },
    );
  }

  const stmt = db.prepare(`
    SELECT
      strftime('${format}', datetime(s.timestamp, 'unixepoch')) AS bucket,
      MIN(s.timestamp) AS ts,
      AVG(s.temperature) AS temperature,
      AVG(s.humidity) AS humidity,
      AVG(s.carbon_dioxide) AS carbon_dioxide,
      COUNT(*) AS count
    FROM sensor_data s
    WHERE s.timestamp >= ?
    AND s.timestamp <= ?
    AND s.location = ?
    GROUP BY bucket
    ORDER BY ts
  `);

  const result = stmt.all(timeStart, timeEnd, location);
  return NextResponse.json({ result });
}
