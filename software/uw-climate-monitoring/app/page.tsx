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
import SentimentSelector, {
  type LikertValue,
} from "@/components/sentimentSelector";
import { Button } from "@/components/ui/button";
import { useState, type ReactNode } from "react";
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

function buildIcons(
  fileNames: [string, string, string, string, string],
): Record<LikertValue, ReactNode> {
  const [one, two, three, four, five] = fileNames;
  return {
    1: <img src={`/emojis/${one}.svg`} alt="" className="size-full" />,
    2: <img src={`/emojis/${two}.svg`} alt="" className="size-full" />,
    3: <img src={`/emojis/${three}.svg`} alt="" className="size-full" />,
    4: <img src={`/emojis/${four}.svg`} alt="" className="size-full" />,
    5: <img src={`/emojis/${five}.svg`} alt="" className="size-full" />,
  };
}

export default function Page() {
  const [tempSentiment, setTempSentiment] = useState<
    LikertValue | undefined
  >(undefined);
  const [humiditySentiment, setHumiditySentiment] = useState<
    LikertValue | undefined
  >(undefined);
  const [airSentiment, setAirSentiment] = useState<LikertValue | undefined>(
    undefined,
  );
  const [location, setLocation] = useState({
    building: "PSE",
    floor: 4,
    room: 4417,
  });
  const [mobileStep, setMobileStep] = useState(0);
  const router = useRouter();

  const questions = [
    {
      title: "How is the temperature?",
      scaleLabels: SENTIMENT_LABELS.temperature,
      emojis: ["❄️", "🔥"] as [string, string],
      icons: buildIcons([
        "temp-too-cold",
        "temp-slightly-cold",
        "temp-comfortable",
        "temp-slightly-hot",
        "temp-too-hot",
      ]),
      defaultValue: tempSentiment,
      onValueChange: setTempSentiment,
    },
    {
      title: "How is the humidity?",
      scaleLabels: SENTIMENT_LABELS.humidity,
      emojis: ["🌵", "🌧️"] as [string, string],
      icons: buildIcons([
        "humidity-3",
        "humidity-5",
        "humidity-4",
        "humidity-1",
        "humidity-2",
      ]),
      defaultValue: humiditySentiment,
      onValueChange: setHumiditySentiment,
    },
    {
      title: "How is the air quality?",
      scaleLabels: SENTIMENT_LABELS.air,
      emojis: ["😷", "🌳"] as [string, string],
      icons: buildIcons([
        "air-very-stuffy",
        "air-slightly-stuffy",
        "air-neutral",
        "air-slightly-fresh",
        "air-very-fresh",
      ]),
      defaultValue: airSentiment,
      onValueChange: setAirSentiment,
    },
  ];

  const isLastMobileStep = mobileStep === questions.length - 1;

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

  const handleMobileNext = () => {
    if (isLastMobileStep) {
      handleSubmit();
    } else {
      setMobileStep((step) => step + 1);
    }
  };

  const handleMobileBack = () => {
    if (mobileStep === 0) {
      handleRedirect();
    } else {
      setMobileStep((step) => step - 1);
    }
  };

  return (
    <main className="p-6 pb-[var(--mobile-footer-h)] sm:p-10 sm:pb-10 md:p-16 flex flex-col w-full min-h-screen bg-white [--mobile-footer-h:7rem]">
      <header className="flex flex-col gap-4 py-2">
        <div className="mb-2 flex items-center justify-between gap-2 sm:hidden">
          {questions.map((_, index) => (
            <span
              key={index}
              className={
                index === mobileStep
                  ? "h-1 flex-1 rounded-full bg-slate-800"
                  : "h-1 flex-1 rounded-full bg-slate-200"
              }
            />
          ))}
        </div>
        <h1 className="font-semibold text-left text-3xl sm:hidden">
          {questions[mobileStep].title}
        </h1>
        <h1 className="hidden font-bold text-left text-3xl sm:block sm:text-4xl md:text-5xl">
          How are you feeling today?
        </h1>
        <p className="text-sm text-neutral-500">
          Your responses will be reported in real time on the comfort map.
        </p>
      </header>
      <section className="flex flex-col mt-6">
        <div className="flex flex-row flex-wrap items-center gap-y-2">
          <FaLocationDot />
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
            <SelectContent alignItemWithTrigger={false} align="start">
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
        {/* Mobile: one question at a time */}
        <div className="sm:hidden">
          <SentimentSelector
            key={mobileStep}
            {...questions[mobileStep]}
            hideTitle
          />

          <div className="fixed inset-x-0 bottom-0 flex h-[var(--mobile-footer-h)] w-full items-center justify-center gap-4 bg-white px-6">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 py-4 px-8 text-base font-semibold rounded-full bg-neutral-300 hover:bg-neutral-400"
              onClick={handleMobileBack}
            >
              {mobileStep === 0 ? "Exit" : "Back"}
            </Button>
            <Button
              variant="default"
              size="lg"
              className="flex-1 py-4 px-8 text-base font-semibold rounded-full"
              onClick={handleMobileNext}
            >
              {isLastMobileStep ? "Submit" : "Next"}
            </Button>
          </div>
        </div>

        {/* Tablet/desktop: all questions at once */}
        <div className="hidden sm:block">
          {questions.map((question) => (
            <SentimentSelector key={question.title} {...question} />
          ))}
        </div>
      </section>
      <div className="hidden w-full flex-wrap justify-center p-2 gap-4 mt-8 sm:flex">
        <Button
          variant="secondary"
          size="lg"
          className="py-4 px-8 sm:py-6 sm:px-12 text-base sm:text-lg font-semibold rounded-full bg-neutral-300 hover:bg-neutral-400"
          onClick={handleRedirect}
        >
          Exit
        </Button>
        <Button
          variant="default"
          size="lg"
          className="py-4 px-8 sm:py-6 sm:px-12 text-base sm:text-lg font-semibold rounded-full"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </main>
  );
}
