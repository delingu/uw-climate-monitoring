import Database from "better-sqlite3";

const db = new Database("uw-climate-monitoring.db");

// epoch time: milliseconds since January 1st, 1970
db.exec(`
  CREATE TABLE IF NOT EXISTS sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER DEFAULT (unixepoch()),
    location TEXT,
    temperature REAL,
    humidity REAL,
    carbon_dioxide REAL
  );

  CREATE TABLE IF NOT EXISTS sentiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER DEFAULT (unixepoch()),
    location TEXT,
    temp_sentiment INTEGER,
    humidity_sentiment INTEGER,
    air_sentiment INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_sensor_data_time ON sensor_data(location, timestamp);
`);

export default db;
