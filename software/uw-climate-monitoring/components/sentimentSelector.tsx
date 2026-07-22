"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type LikertValue = 1 | 2 | 3 | 4 | 5;

const SCALE_VALUES: LikertValue[] = [1, 2, 3, 4, 5];

export interface SentimentSelectorProps {
  title: string;
  emojis: [React.ReactNode, React.ReactNode];
  scaleLabels: Partial<Record<LikertValue, string>>;
  defaultValue?: LikertValue;
  onValueChange?: (value: LikertValue) => void;
}

export default function SentimentSelector({
  title,
  emojis,
  scaleLabels,
  defaultValue = 3,
  onValueChange,
}: SentimentSelectorProps) {
  const [selectedValue, setSelectedValue] =
    React.useState<LikertValue>(defaultValue);

  const handleChange = (nextValue: LikertValue) => {
    setSelectedValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <section className="w-full px-6 py-4">
      <h2 className="text-l font-bold tracking-tight text-slate-950">
        {title}
      </h2>

      <div className="mt-6 flex items-start">
        <span className="flex h-10 items-center text-7xl leading-none">
          {emojis[0]}
        </span>

        <div className="relative flex-1">
          <div className="absolute top-5 right-[10%] left-[10%] h-0.5 -translate-y-1/2 bg-slate-700" />

          <div className="relative grid grid-cols-5">
            {SCALE_VALUES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleChange(option)}
                className="flex cursor-pointer flex-col items-center text-center"
              >
                <span
                  className={cn(
                    "size-10 rounded-full border-[3px] border-slate-700 bg-white transition-colors duration-200",
                    selectedValue === option && "bg-slate-800",
                  )}
                />

                <span className="mt-3 text-sm leading-5 text-slate-700">
                  {scaleLabels[option]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <span className="flex h-10 items-center text-7xl leading-none">
          {emojis[1]}
        </span>
      </div>
    </section>
  );
}
