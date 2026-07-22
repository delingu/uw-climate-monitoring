import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface SentimentDataPayload {
  location: string;
  tempSentiment: number;
  humiditySentiment: number;
  airSentiment: number;
}

// returns sentiment data stored in db for heatmap
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
   FROM sentiments s 
   WHERE s.timestamp >= ?  
   AND s.timestamp <= ? 
   AND s.location = ?`);

  const result = stmt.all(timeStart, timeEnd, location);
  return NextResponse.json({ result });
}

export async function POST(request: NextRequest) {
  const {
    location,
    tempSentiment,
    humiditySentiment,
    airSentiment,
  }: SentimentDataPayload = await request.json();

  // could add checks for missing location/sentiment data
  const stmt = db.prepare(`
   INSERT INTO sentiments (location, temp_sentiment, humidity_sentiment, air_sentiment) 
   VALUES (?, ?, ?, ?)`);

  console.log({ location, tempSentiment, humiditySentiment, airSentiment });
  const result = stmt.run(
    JSON.stringify(location),
    tempSentiment,
    humiditySentiment,
    airSentiment,
  );
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
