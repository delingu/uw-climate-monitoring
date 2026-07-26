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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdOutlineLayers } from "react-icons/md";
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

const items = [{ label: "Floor 4", value: "Floor 4" }];

// will adjust: time period for data displayed
const WINDOW_SECONDS = 24 * 60 * 60;

// refresh rate for data: 1 minute
const REFRESH_MS = 60_000;

// one averaged row per room, as returned by /api/sentiment
interface RoomSentiment extends MetricRow {
  location: string;
  count: number;
}

export default function Home() {
  // state variable for the rows of sentiment data in db
  const [rows, setRows] = useState<RoomSentiment[]>([]);
  const [layer, setLayer] = useState<Layer>("temperature");

  const router = useRouter();

  // fetches all sentiment data on mount
  useEffect(() => {
    const load = async () => {
      const now = Math.floor(Date.now() / 1000);
      const params = new URLSearchParams({
        timeStart: String(now - WINDOW_SECONDS),
        timeEnd: String(now),
      });

      const response = await fetch(`/api/sentiment?${params}`);
      const { result } = await response.json();
      setRows(result);
    };

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

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
      <header className="flex py-2 items-center">
        <div className="w-1/2 flex flex-col">
          <div className="flex flex-row gap-x-4">
            <h1 className="font-bold text-xl">PSE</h1>
            <Select items={items} value={"Floor 4"}>
              <SelectTrigger className="w-[90px] text-sm h-2">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs mt-1">Subjective discomfort, self-reported</p>
        </div>
        <div className="w-1/2 flex flex-col justify-end items-end">
          <Tabs defaultValue="home" className="">
            <TabsList className="group-data-horizontal/tabs:h-12 p-1.5">
              <TabsTrigger
                value="home"
                className="data-active:bg-black data-active:text-white data-active:hover:text-white"
              >
                Home
              </TabsTrigger>
              <TabsTrigger
                value="dataTrends"
                className="data-active:bg-black data-active:text-white data-active:hover:text-white"
              >
                Data & Trends
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
      <section className="flex pl-8 py-8 justify-between">
        <div className="flex flex-row gap-16">
          {layer === "humidity" ? (
            <div className="flex flex-col">
              <h4>Humidity</h4>
              <div className="mt-2 text-xs flex flex-row w-full items-baseline gap-3">
                <p>Too Dry</p>
                <div className="grow h-2 min-w-25 from-[#F4E194] to-[#B099E9] bg-linear-to-r" />
                <p>Too Humid</p>
              </div>
            </div>
          ) : layer === "temperature" ? (
            <div className="flex flex-col">
              <h4>Temperature</h4>
              <div className="mt-2 text-xs flex flex-row w-full items-baseline gap-3">
                <p>Too Cold</p>
                <div className="grow h-2 min-w-25 from-[#9EDAFF] to-[#DD6E5B] bg-linear-to-r" />
                <p>Too Hot</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <h4>Air Quality</h4>
              <div className="mt-2 text-xs flex flex-row w-full items-baseline gap-3">
                <p>Very Stuffy</p>
                <div className="grow h-2 min-w-25 from-[#F3BB77] to-[#B3DBB8] bg-linear-to-r" />
                <p>Very Fresh</p>
              </div>
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" />}>
            <MdOutlineLayers />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setLayer("temperature")}>
              Temperature
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayer("humidity")}>
              Humidity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayer("air")}>
              Air Quality
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
      <section className="flex grow px-8">
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
