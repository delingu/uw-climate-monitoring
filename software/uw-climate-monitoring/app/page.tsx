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
import { SENTIMENT_LABELS } from "@/lib/scales";
import { formatLocation, locationId } from "@/lib/location";

const items = [
  { label: "4043", value: "4043" },
  { label: "4053", value: "4053" },
  { label: "4417", value: "4417" },
  { label: "4433", value: "4433" },
  { label: "4437", value: "4437" },
];

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
        location: locationId(location),
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
      <section className="flex flex-col px-8 mt-2">
        <div className="flex flex-row items-center">
          <FaLocationDot />
          <h2 className="ml-3 font-bold">Location: </h2>
          <p className="font-semibold mx-4">{formatLocation(location)}</p>
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
          scaleLabels={SENTIMENT_LABELS.temperature}
          emojis={["❄️", "🔥"]}
          onValueChange={setTempSentiment}
        />
        <SentimentSelector
          title="Humidity"
          scaleLabels={SENTIMENT_LABELS.humidity}
          emojis={["🌵", "🌧️"]}
          onValueChange={setHumiditySentiment}
        />
        <SentimentSelector
          title="Air Quality"
          scaleLabels={SENTIMENT_LABELS.air}
          emojis={["😷", "🌳"]}
          onValueChange={setAirSentiment}
        />
      </section>
      <div className="flex w-[40%] self-end justify-end h-32 p-2 gap-4">
        <Button
          variant="secondary"
          size="lg"
          className="p-6 text-lg font-semibold rounded-full"
          onClick={handleRedirect}
        >
          Skip
        </Button>
        <Button
          variant="default"
          size="lg"
          className="p-6 text-lg font-semibold rounded-full"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </main>
  );
}
