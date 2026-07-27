"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import FloorPlanMap from "@/components/floorPlan";
import { PSE_FLOOR_4 } from "@/lib/floorPlan";
import RoomSentimentCard from "@/components/roomSentimentCard";
import {
  Layer,
  MetricRow,
  airHistogram,
  bucketForRow,
  colorFor,
  humidityHistogram,
  temperatureHistogram,
} from "@/lib/scales";
import { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { Time, WaterDrop, WindStrong } from "griddy-icons";
import { PiThermometerSimpleFill } from "react-icons/pi";

const floors = [{ label: "Floor 4", value: "Floor 4" }];
const timeRanges = [
  { label: "24H", value: "24H" },
  { label: "Weekly", value: "Weekly" },
  { label: "Monthly", value: "Monthly" },
  { label: "Yearly", value: "Yearly" },
  { label: "All time", value: "All time" },
];

const DAY = 24 * 60 * 60;

const WINDOW_SECONDS: Record<string, number | null> = {
  "24H": DAY,
  Weekly: 7 * DAY,
  Monthly: 30 * DAY,
  Yearly: 365 * DAY,
  "All time": null,
};

// refresh rate for data: 1 minute
const REFRESH_MS = 60_000;

// one averaged row per room, as returned by /api/sentiment
interface RoomSentiment extends MetricRow {
  location: string;
  count: number;
}

// e.g. "1 minute ago", "32 seconds ago"
function relativeTime(fromMs: number, nowMs: number): string {
  const seconds = Math.max(0, Math.floor((nowMs - fromMs) / 1000));
  if (seconds < 1) return "just now";

  const phrase = (value: number, unit: string) =>
    `${value} ${unit}${value === 1 ? "" : "s"} ago`;

  if (seconds < 60) return phrase(seconds, "second");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return phrase(minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return phrase(hours, "hour");
  return phrase(Math.floor(hours / 24), "day");
}

const LABEL_TICK_MS = 30_000;

function LastUpdated({ since }: { since: number | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), LABEL_TICK_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1">
      <Time size={16} />
      <p>Last updated: {since === null ? "—" : relativeTime(since, now)}</p>
    </div>
  );
}

export default function Home() {
  // state variable for the rows of sentiment data in db
  const [rows, setRows] = useState<RoomSentiment[]>([]);
  const [layer, setLayer] = useState<Layer>("temperature");
  const [timeRange, setTimeRange] = useState("24H");
  // epoch ms of the last successful fetch, for the "last updated" label
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const router = useRouter();

  // reloads on mount and whenever the time range changes, then polls
  useEffect(() => {
    const load = async () => {
      const now = Math.floor(Date.now() / 1000);
      const window = WINDOW_SECONDS[timeRange];
      const params = new URLSearchParams({
        timeStart: String(window === null ? 0 : now - window),
        timeEnd: String(now),
      });

      const response = await fetch(`/api/sentiment?${params}`);
      const { result } = await response.json();
      setRows(result);
      setLastUpdated(Date.now());
    };

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => clearInterval(interval);
  }, [timeRange]);

  const roomColors: Record<string, string> = {};
  for (const row of rows) {
    roomColors[row.location] = colorFor(
      layer,
      "sentiment",
      bucketForRow(layer, "sentiment", row),
    );
  }

  const layerHistogram = (row: MetricRow) => {
    if (layer === "temperature") {
      return temperatureHistogram(row);
    } else if (layer === "humidity") {
      return humidityHistogram(row);
    } else {
      return airHistogram(row);
    }
  };

  const handleRedirect = () => {
    router.push("/");
  };

  return (
    <main className="p-16 flex flex-col w-full min-h-screen bg-white">
      <Button
        variant="default"
        size="default"
        className="flex fixed bottom-12 right-16 rounded-full 
          items-center justify-center text-sm font-semibold transition-transform duration-200 hover:scale-105
          h-auto px-4 py-3"
        onClick={handleRedirect}
      >
        <AiOutlinePlus />
        Log how you feel
      </Button>
      <header className="flex flex-row justify-between w-full">
        <div>
          <h1 className="font-bold text-xl">Comfort Map</h1>
          <p className="text-xs">
            Subjective comfort levels recorded. Come log how you feel!
          </p>
        </div>
        <Tabs defaultValue="home" className="">
          <TabsList className="group-data-horizontal/tabs:h-12 p-1.5 rounded-full">
            <TabsTrigger
              value="home"
              className="data-active:bg-black data-active:text-white data-active:hover:text-white rounded-full"
            >
              Comfort Map
            </TabsTrigger>
            <TabsTrigger
              value="dataTrends"
              className="data-active:bg-black data-active:text-white data-active:hover:text-white rounded-full"
            >
              Data & Trends
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      <section className="flex pt-4 item-center flex-row justify-between">
        <div className="flex flex-row gap-x-4 items-center">
          <h2 className="font-bold text-xl">PSE</h2>
          <Select items={floors} value={"Floor 4"}>
            <SelectTrigger className="flex shrink text-xs h-2 rounded-full font-bold">
              <SelectValue placeholder="Floor" />
            </SelectTrigger>
            <SelectContent className="rounded-full">
              <SelectGroup>
                {floors.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                    className="rounded-full"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Select
          items={timeRanges}
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as string)}
        >
          <SelectTrigger className="flex shrink text-xs rounded-full font-bold">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent
            className="rounded-2xl"
            align="end"
            alignItemWithTrigger={false}
          >
            <SelectGroup className="">
              {timeRanges.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  className="rounded-full"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </section>
      <section className="flex flex-col gap-2 py-4">
        <Tabs value={layer} onValueChange={(value) => setLayer(value as Layer)}>
          <TabsList variant="line">
            <TabsTrigger value="temperature">
              <PiThermometerSimpleFill />
              Temperature
            </TabsTrigger>
            <TabsTrigger value="humidity">
              <WaterDrop />
              Humidity
            </TabsTrigger>
            <TabsTrigger value="air">
              <WindStrong />
              Air Quality
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-row pl-1 text-xs pt-4 w-full justify-between">
          {layer === "humidity" ? (
            <div className="flex flex-col">
              <div className="flex flex-row items-baseline gap-3">
                <p>Too Dry</p>
                <div className="rounded-full grow h-2 min-w-35 from-[#F4E194] to-[#B099E9] bg-linear-to-r" />
                <p>Too Humid</p>
              </div>
            </div>
          ) : layer === "temperature" ? (
            <div className="flex flex-col">
              <div className="flex flex-row items-baseline gap-3">
                <p>Too Cold</p>
                <div className="rounded-full grow h-2 min-w-35 from-[#9EDAFF] to-[#DD6E5B] bg-linear-to-r" />
                <p>Too Hot</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-row items-baseline gap-3">
                <p>Very Stuffy</p>
                <div className="rounded-full grow h-2 min-w-35 from-[#F3BB77] to-[#B3DBB8] bg-linear-to-r" />
                <p>Very Fresh</p>
              </div>
            </div>
          )}
          <LastUpdated since={lastUpdated} />
        </div>
      </section>
      <section className="flex grow pb-8">
        <FloorPlanMap
          plan={PSE_FLOOR_4}
          roomColors={roomColors}
          roomCard={(roomId) => {
            const row = rows.find((candidate) => candidate.location === roomId);

            return (
              <RoomSentimentCard
                roomId={roomId}
                layer={layer}
                counts={row ? layerHistogram(row) : []}
              />
            );
          }}
        />
      </section>
    </main>
  );
}
