import db from "@/lib/db";

export default function Home() {
  const rows = db
    .prepare(`SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 5`)
    .all();

  console.log(rows);

  return <div>Check the server console for sensor data.</div>;
}
