// "scales" sentiment average values to a colour bucket

export type Layer = "temperature" | "humidity" | "air";
export type DataSource = "sentiment" | "sensor";
export type Bucket = 0 | 1 | 2 | 3 | 4;

export const NO_DATA = "#f4f4f5";

// blue -> red
const COLD_TO_HOT = ["#9EDAFF", "#AEBFD6", "#BEA4AD", "#CD8984", "#DD6E5B"];

// yellow -> purple
const DRY_TO_HUMID = ["#F4E194", "#E3CFA9", "#D2BDBF", "#C1ABD4", "#B099E9"];

// orange -> green
const STUFFY_TO_FRESH = ["#F3BB77", "#E3C387", "#D3CB98", "#C3D3A8", "#B3DBB8"];
// reverse since stuffy -> high co2
const CO2_SEQUENTIAL = [...STUFFY_TO_FRESH].reverse();

const BY_LAYER: Record<Layer, string[]> = {
  temperature: COLD_TO_HOT,
  humidity: DRY_TO_HUMID,
  air: STUFFY_TO_FRESH,
};

export function paletteFor(layer: Layer, source: DataSource): string[] {
  if (layer === "air" && source === "sensor") {
    return CO2_SEQUENTIAL;
  }

  return BY_LAYER[layer];
}

// bucket boundaries
const SENSOR_THRESHOLDS: Record<Layer, number[]> = {
  temperature: [18, 20, 24, 26],
  humidity: [30, 40, 60, 70],
  air: [600, 800, 1000, 1400],
};

export const SENTIMENT_LABELS: Record<Layer, Record<number, string>> = {
  temperature: {
    1: "Too cold",
    2: "Slightly cold",
    3: "Comfortable",
    4: "Slightly hot",
    5: "Too hot",
  },
  humidity: {
    1: "Too dry",
    2: "Slightly dry",
    3: "Comfortable",
    4: "Slightly humid",
    5: "Too humid",
  },
  air: {
    1: "Very stuffy",
    2: "Slightly stuffy",
    3: "Neutral",
    4: "Slightly fresh",
    5: "Very fresh",
  },
};

// round before bucketing
export function bucketFromSentiment(value: number): Bucket {
  const rounded = Math.round(value);
  return (Math.min(5, Math.max(1, rounded)) - 1) as Bucket;
}

export function bucketFromSensor(layer: Layer, value: number): Bucket {
  return SENSOR_THRESHOLDS[layer].filter((stop) => value >= stop)
    .length as Bucket;
}

export interface MetricRow {
  temp_sentiment?: number;
  humidity_sentiment?: number;
  air_sentiment?: number;
  temperature?: number;
  humidity?: number;
  carbon_dioxide?: number;
  // how many people picked each of the 5 options
  temp_1?: number;
  temp_2?: number;
  temp_3?: number;
  temp_4?: number;
  temp_5?: number;
  humidity_1?: number;
  humidity_2?: number;
  humidity_3?: number;
  humidity_4?: number;
  humidity_5?: number;
  air_1?: number;
  air_2?: number;
  air_3?: number;
  air_4?: number;
  air_5?: number;
}

export function temperatureHistogram(row: MetricRow): number[] {
  return [
    row.temp_1 ?? 0,
    row.temp_2 ?? 0,
    row.temp_3 ?? 0,
    row.temp_4 ?? 0,
    row.temp_5 ?? 0,
  ];
}

export function humidityHistogram(row: MetricRow): number[] {
  return [
    row.humidity_1 ?? 0,
    row.humidity_2 ?? 0,
    row.humidity_3 ?? 0,
    row.humidity_4 ?? 0,
    row.humidity_5 ?? 0,
  ];
}

export function airHistogram(row: MetricRow): number[] {
  return [
    row.air_1 ?? 0,
    row.air_2 ?? 0,
    row.air_3 ?? 0,
    row.air_4 ?? 0,
    row.air_5 ?? 0,
  ];
}

const LAYER_COLUMNS: Record<Layer, Record<DataSource, keyof MetricRow>> = {
  temperature: { sentiment: "temp_sentiment", sensor: "temperature" },
  humidity: { sentiment: "humidity_sentiment", sensor: "humidity" },
  air: { sentiment: "air_sentiment", sensor: "carbon_dioxide" },
};

// returns null when a room has no data
export function bucketForRow(
  layer: Layer,
  source: DataSource,
  row: MetricRow,
): Bucket | null {
  const value = row[LAYER_COLUMNS[layer][source]];

  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return source === "sentiment"
    ? bucketFromSentiment(value)
    : bucketFromSensor(layer, value);
}

export function colorFor(
  layer: Layer,
  source: DataSource,
  bucket: Bucket | null,
): string {
  return bucket === null ? NO_DATA : paletteFor(layer, source)[bucket];
}
