import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface SentimentDataPayload {
  // canonical room key from lib/location, e.g. "PSE-4-4417"
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

  if (!timeStart || !timeEnd) {
    return NextResponse.json(
      { error: "Missing time/location query params" },
      { status: 400 },
    );
  }

  // consider time storage format:
  // stored as unixepoch in db

  // one averaged data row per room for map
  // also returns total count for each option when
  let query = `
    SELECT
      s.location,
      AVG(s.temp_sentiment) AS temp_sentiment,
      AVG(s.humidity_sentiment) AS humidity_sentiment,
      AVG(s.air_sentiment) AS air_sentiment,
      COUNT(*) AS count,
      SUM(CASE WHEN s.temp_sentiment = 1 THEN 1 ELSE 0 END) AS temp_1,
      SUM(CASE WHEN s.temp_sentiment = 2 THEN 1 ELSE 0 END) AS temp_2,
      SUM(CASE WHEN s.temp_sentiment = 3 THEN 1 ELSE 0 END) AS temp_3,
      SUM(CASE WHEN s.temp_sentiment = 4 THEN 1 ELSE 0 END) AS temp_4,
      SUM(CASE WHEN s.temp_sentiment = 5 THEN 1 ELSE 0 END) AS temp_5,
      SUM(CASE WHEN s.humidity_sentiment = 1 THEN 1 ELSE 0 END) AS humidity_1,
      SUM(CASE WHEN s.humidity_sentiment = 2 THEN 1 ELSE 0 END) AS humidity_2,
      SUM(CASE WHEN s.humidity_sentiment = 3 THEN 1 ELSE 0 END) AS humidity_3,
      SUM(CASE WHEN s.humidity_sentiment = 4 THEN 1 ELSE 0 END) AS humidity_4,
      SUM(CASE WHEN s.humidity_sentiment = 5 THEN 1 ELSE 0 END) AS humidity_5,
      SUM(CASE WHEN s.air_sentiment = 1 THEN 1 ELSE 0 END) AS air_1,
      SUM(CASE WHEN s.air_sentiment = 2 THEN 1 ELSE 0 END) AS air_2,
      SUM(CASE WHEN s.air_sentiment = 3 THEN 1 ELSE 0 END) AS air_3,
      SUM(CASE WHEN s.air_sentiment = 4 THEN 1 ELSE 0 END) AS air_4,
      SUM(CASE WHEN s.air_sentiment = 5 THEN 1 ELSE 0 END) AS air_5
    FROM sentiments s
    WHERE s.timestamp >= ?
    AND s.timestamp <= ? `;
  const params: any[] = [timeStart, timeEnd];

  if (location) {
    query += ` AND s.location = ? `;
    params.push(location);
  }

  query += ` GROUP BY s.location`;

  const stmt = db.prepare(query);
  const result = stmt.all(...params);
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

  const result = stmt.run(
    location,
    tempSentiment,
    humiditySentiment,
    airSentiment,
  );
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
