"use client";

import * as React from "react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type LikertValue = 1 | 2 | 3 | 4 | 5;

const SCALE_VALUES: LikertValue[] = [1, 2, 3, 4, 5];

interface ChoiceIconProps {
  icon: React.ReactNode | undefined;
  index: number;
  emojis: [React.ReactNode, React.ReactNode];
  sizeClassName: string;
  emojiTextClassName: string;
}

function ChoiceIcon({
  icon,
  index,
  emojis,
  sizeClassName,
  emojiTextClassName,
}: ChoiceIconProps) {
  if (icon) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${sizeClassName}`}
      >
        {icon}
      </span>
    );
  }

  const isFirst = index === 0;
  const isLast = index === SCALE_VALUES.length - 1;

  if (!isFirst && !isLast) {
    return null;
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-slate-100 leading-none ${sizeClassName} ${emojiTextClassName}`}
    >
      {isFirst ? emojis[0] : emojis[1]}
    </span>
  );
}

export interface SentimentSelectorProps {
  title: string;
  emojis: [React.ReactNode, React.ReactNode];
  icons?: Partial<Record<LikertValue, React.ReactNode>>;
  scaleLabels: Partial<Record<LikertValue, string>>;
  defaultValue?: LikertValue;
  onValueChange?: (value: LikertValue) => void;
  hideTitle?: boolean;
}

export default function SentimentSelector({
  title,
  emojis,
  icons,
  scaleLabels,
  defaultValue,
  onValueChange,
  hideTitle = false,
}: SentimentSelectorProps) {
  const [selectedValue, setSelectedValue] = React.useState<
    LikertValue | undefined
  >(defaultValue);

  const handleChange = (nextValue: LikertValue) => {
    setSelectedValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <section className="w-full pt-2 pb-8 sm:py-8">
      {!hideTitle && (
        <h2 className="text-lg font-medium tracking-tight text-slate-950">
          {title}
        </h2>
      )}

      <RadioGroup
        value={selectedValue ?? null}
        onValueChange={(value) => handleChange(value as LikertValue)}
      >
        {/* Mobile: emojis in first/last choice, options stacked as rows */}
        <div className="mt-2 flex w-full flex-col gap-2 sm:hidden">
          {SCALE_VALUES.map((option, index) => (
            <label
              key={option}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-5 has-[[data-checked]]:shadow-md"
            >
              <span className="flex items-center gap-4 text-sm text-slate-700">
                <ChoiceIcon
                  icon={icons?.[option]}
                  index={index}
                  emojis={emojis}
                  sizeClassName="size-9"
                  emojiTextClassName="text-lg"
                />
                {scaleLabels[option]}
              </span>

              <RadioGroupItem
                value={option}
                className="shrink-0 border-slate-500"
              />
            </label>
          ))}
        </div>

        {/* Tablet/desktop: single row */}
        <div className="mt-6 hidden items-stretch gap-4 sm:grid sm:grid-cols-5">
          {SCALE_VALUES.map((option, index) => (
            <label
              key={option}
              className="flex h-full min-w-0 flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 px-2 py-4 text-center has-[[data-checked]]:shadow-md"
            >
              <div className="flex flex-1 flex-col items-center justify-center gap-2">
                <ChoiceIcon
                  icon={icons?.[option]}
                  index={index}
                  emojis={emojis}
                  sizeClassName="size-14 md:size-16"
                  emojiTextClassName="text-2xl md:text-3xl"
                />

                <span className="text-sm leading-5 text-slate-700">
                  {scaleLabels[option]}
                </span>
              </div>

              <RadioGroupItem value={option} className="border-slate-500" />
            </label>
          ))}
        </div>
      </RadioGroup>
    </section>
  );
}
