import db from "@/lib/db";

export async function POST(req) {
  const { location, temperature, humidity, carbonDioxide } = await req.json();

  const stmt = db.prepare(`
    INSERT INTO sensor_data (location, temperature, humidity, carbonDioxide)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(location, temperature, humidity, carbonDioxide);

  return Response.json({ id: result.lastInsertRowid }, { status: 201 });
}
