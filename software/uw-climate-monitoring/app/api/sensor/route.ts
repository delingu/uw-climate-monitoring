import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface SensorDataPayload {
  location: string;
  temperature: number;
  humidity: number;
  carbonDioxide: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeStart = searchParams.get("timeStart");
  const timeEnd = searchParams.get("timeEnd");
  const location = searchParams.get("location");

  if (!timeStart || !timeEnd || !location) {
    return NextResponse.json(
      { error: "Missing time/location query params" },
      { status: 400 },
    );
  }

  // consider time storage format:
  // stored as unixepoch in db
  const stmt = db.prepare(`
   SELECT * 
   FROM sensor_data s 
   WHERE s.timestamp >= ?  
   AND s.timestamp <= ? 
   AND s.location = ?`);

  const result = stmt.all(timeStart, timeEnd, location);
  return NextResponse.json({ result });
}

export async function POST(req: NextRequest) {
  const { location, temperature, humidity, carbonDioxide }: SensorDataPayload =
    await req.json();

  const stmt = db.prepare(`
    INSERT INTO sensor_data (location, temperature, humidity, carbon_dioxide)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(location, temperature, humidity, carbonDioxide);

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
