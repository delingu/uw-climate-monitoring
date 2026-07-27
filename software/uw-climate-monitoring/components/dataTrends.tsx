"use client";

import { useEffect, useState } from "react";

import TrendChart, { TrendPoint } from "@/components/trendChart";
import { Bucket, bucketLabel, rangeQuery } from "@/lib/timeRange";
import { roomNumberFromId } from "@/lib/location";

interface TrendRow {
  bucket: string;
  ts: number;
  temperature: number;
  humidity: number;
  carbon_dioxide: number;
  count: number;
}

type MetricKey = "temperature" | "humidity" | "carbon_dioxide";

const METRICS: {
  key: MetricKey;
  title: string;
  color: string;
  unit: string;
  decimals: number;
}[] = [
  {
    key: "temperature",
    title: "Temperature",
    color: "#DD6E5B",
    unit: "°C",
    decimals: 1,
  },
  {
    key: "humidity",
    title: "Humidity",
    color: "#0284c7",
    unit: "%",
    decimals: 1,
  },
  {
    key: "carbon_dioxide",
    title: "CO₂ Levels",
    color: "#8b5cf6",
    unit: " ppm",
    decimals: 0,
  },
];

function series(
  rows: TrendRow[],
  key: MetricKey,
  granularity: Bucket,
): TrendPoint[] {
  return rows.map((row) => ({
    label: bucketLabel(row.bucket, granularity),
    value: Math.round(row[key] * 10) / 10,
  }));
}

const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export interface DataTrendsProps {
  room: string;
  timeRange: string;
}

export default function DataTrends({ room, timeRange }: DataTrendsProps) {
  const [rows, setRows] = useState<TrendRow[]>([]);
  const [bucket, setBucket] = useState<Bucket>("day");

  useEffect(() => {
    const load = async () => {
      const { timeStart, timeEnd, bucket } = rangeQuery(timeRange);
      const params = new URLSearchParams({
        location: room,
        timeStart: String(timeStart),
        timeEnd: String(timeEnd),
        bucket,
      });

      const response = await fetch(`/api/trends?${params}`);
      const { result } = await response.json();
      setRows(result ?? []);
      setBucket(bucket);
    };

    load();
  }, [room, timeRange]);

  const roomNumber = roomNumberFromId(room);

  return (
    <section className="flex-1 overflow-y-auto pb-8 [scrollbar-gutter:stable]">
      <SummaryTiles rows={rows} />

      <div className="mt-4 flex flex-col gap-4">
        {METRICS.map((metric) => (
          <TrendChart
            key={metric.key}
            title={metric.title}
            data={series(rows, metric.key, bucket)}
            color={metric.color}
            unit={metric.unit}
          />
        ))}
      </div>

      <TrendCards rows={rows} roomNumber={roomNumber} />
    </section>
  );
}

// component SummaryTiles
function SummaryTiles({ rows }: { rows: TrendRow[] }) {
  const empty = rows.length === 0;

  const avg = (key: MetricKey) =>
    empty ? null : rows.reduce((sum, r) => sum + r[key], 0) / rows.length;
  const peak = (key: MetricKey) =>
    empty ? null : Math.max(...rows.map((r) => r[key]));

  // CO2 change from first to last bucket, as a signed percentage.
  const co2Change = (() => {
    if (rows.length < 2) return null;
    const first = rows[0].carbon_dioxide;
    const last = rows[rows.length - 1].carbon_dioxide;
    return ((last - first) / first) * 100;
  })();

  const fmt = (value: number | null, decimals: number, unit: string) =>
    value === null ? "—" : `${round(value, decimals)}${unit}`;

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-4 rounded-2xl border border-slate-200 p-6 sm:grid-cols-4">
      <Tile label="Avg Temperature" value={fmt(avg("temperature"), 1, "°C")} />
      <Tile label="Peak Humidity" value={fmt(peak("humidity"), 0, "%")} />
      <Tile label="Avg CO₂" value={fmt(avg("carbon_dioxide"), 0, " ppm")} />
      <Tile
        label="CO₂ vs start"
        value={
          co2Change === null
            ? "—"
            : `${co2Change >= 0 ? "▲" : "▼"} ${Math.abs(round(co2Change, 0))}%`
        }
        // rising CO2 is worse, falling is better
        tone={co2Change === null ? undefined : co2Change > 0 ? "bad" : "good"}
      />
    </div>
  );
}

// component Tile
function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-600"
      : tone === "bad"
        ? "text-rose-600"
        : "text-slate-900";

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

// component TrendCards
function TrendCards({
  rows,
  roomNumber,
}: {
  rows: TrendRow[];
  roomNumber: string;
}) {
  if (rows.length < 2) return null;

  const first = rows[0];
  const last = rows[rows.length - 1];

  const tempDelta = round(last.temperature - first.temperature, 1);
  const co2Pct = round(
    ((last.carbon_dioxide - first.carbon_dioxide) / first.carbon_dioxide) * 100,
    0,
  );

  const humidityPeak = rows.reduce((top, r) =>
    r.humidity > top.humidity ? r : top,
  );

  const cards = [
    {
      title: "Historical Trends • Temperature",
      body: `Room ${roomNumber}'s temperature ${
        tempDelta >= 0 ? "rose" : "fell"
      } ${Math.abs(tempDelta)}°C across this range.`,
    },
    {
      title: "Historical Trends • Humidity",
      body: `Room ${roomNumber}'s humidity peaked at ${round(
        humidityPeak.humidity,
        0,
      )}% in ${bucketLabelLong(humidityPeak.bucket)}.`,
    },
    {
      title: "Historical Trends • CO₂",
      body: `Room ${roomNumber}'s CO₂ ${
        co2Pct >= 0 ? "rose" : "improved"
      } ${Math.abs(co2Pct)}% across this range.`,
    },
  ];

  return (
    <div className="mt-4 flex flex-col gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-slate-200 p-4"
        >
          <p className="text-xs font-semibold text-slate-500">{card.title}</p>
          <p className="mt-1 text-sm text-slate-900">{card.body}</p>
        </div>
      ))}
    </div>
  );
}

// a fuller label for prose ("July 2026" / "Jul 24" / "3PM").
function bucketLabelLong(bucket: string): string {
  if (bucket.length === 7) {
    return `${bucketLabel(bucket, "month")} ${bucket.slice(0, 4)}`;
  }
  return bucketLabel(bucket, bucket.length > 10 ? "hour" : "day");
}
