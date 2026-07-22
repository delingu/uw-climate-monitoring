"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaLocationDot } from "react-icons/fa6";
import SentimentSelector from "@/components/sentimentSelector";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

const items = [
  { label: "4043", value: "4043" },
  { label: "4053", value: "4053" },
  { label: "4417", value: "4417" },
];

const SCALE_LABELS = {
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
    1: "Too stuffy",
    2: "Slightly stuffy",
    3: "Comfortable",
    4: "Slightly fresh",
    5: "Too fresh",
  },
};

export default function Page() {
  const [tempSentiment, setTempSentiment] = useState(3);
  const [humiditySentiment, setHumiditySentiment] = useState(3);
  const [airSentiment, setAirSentiment] = useState(3);
  const [location, setLocation] = useState({
    building: "PSE",
    floor: 4,
    room: 4417,
  });
  const router = useRouter();

  const handleSubmit = async () => {
    await fetch("/api/sentiment", {
      method: "POST",
      headers: {},
      body: JSON.stringify({
        location,
        tempSentiment,
        humiditySentiment,
        airSentiment,
      }),
    });
    handleRedirect();
  };

  const handleRedirect = () => {
    router.push("/home");
  };

  return (
    <main className="p-16 flex flex-col w-screen h-screen bg-white">
      <header className="flex justify-center py-2">
        <h1 className="font-bold">How are you feeling today?</h1>
      </header>
      <section className="flex flex-col grow px-8 py-6">
        <div className="flex flex-row items-center h-2">
          <FaLocationDot />
          <h2 className="ml-3 font-bold">Location: </h2>
          <p className="font-semibold mx-4">
            {location.building} {location.floor}th Floor
          </p>
          <Select
            items={items}
            value={String(location.room)}
            onValueChange={(value) =>
              setLocation({ ...location, room: Number(value) })
            }
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Room" />
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
        <SentimentSelector
          title="Temperature"
          scaleLabels={SCALE_LABELS.temperature}
          emojis={["❄️", "🔥"]}
          onValueChange={setTempSentiment}
        />
        <SentimentSelector
          title="Humidity"
          scaleLabels={SCALE_LABELS.humidity}
          emojis={["🌵", "🌧️"]}
          onValueChange={setHumiditySentiment}
        />
        <SentimentSelector
          title="Air quality"
          scaleLabels={SCALE_LABELS.air}
          emojis={["😷", "🌳"]}
          onValueChange={setAirSentiment}
        />
      </section>
      <div className="flex w-[40%] self-end justify-end h-32 p-2 gap-4">
        <Button
          variant="outline"
          size="lg"
          className="p-6 text-lg font-semibold"
          onClick={handleRedirect}
        >
          Skip
        </Button>
        <Button
          variant="default"
          size="lg"
          className="p-6 text-lg font-semibold"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </main>
  );
}
