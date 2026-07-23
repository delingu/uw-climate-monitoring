"use client";

import * as React from "react";

import { roomNumberFromId } from "@/lib/location";
import { Layer, SENTIMENT_LABELS, paletteFor } from "@/lib/scales";

export interface RoomSentimentCardProps {
  roomId: string;
  layer: Layer;
  // counts per option, lowest to highest
  counts: number[];
}

export default function RoomSentimentCard({
  roomId,
  layer,
  counts,
}: RoomSentimentCardProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const total = counts.reduce((sum, count) => sum + count, 0);

  return (
    <div className="w-56 rounded-xl bg-white p-3 shadow-lg">
      <p className="text-[10px] text-slate-500">
        Room {roomNumberFromId(roomId)}
      </p>

      {total === 0 ? (
        <p className="mt-2 text-xs text-slate-500">No responses yet</p>
      ) : (
        <Distribution
          layer={layer}
          counts={counts}
          total={total}
          hovered={hovered}
          onHover={setHovered}
        />
      )}
    </div>
  );
}

function Distribution({
  layer,
  counts,
  total,
  hovered,
  onHover,
}: {
  layer: Layer;
  counts: number[];
  total: number;
  hovered: number | null;
  onHover: (index: number | null) => void;
}) {
  const palette = paletteFor(layer, "sentiment");
  const tallest = Math.max(...counts);

  const modal = counts.indexOf(tallest);
  const shown = hovered ?? modal;

  return (
    <>
      <p className="mt-1 text-sm font-semibold text-slate-900">
        {SENTIMENT_LABELS[layer][shown + 1]}
      </p>
      <p className="text-[10px] text-slate-500">
        {counts[shown]} of {total} responses
      </p>

      <div className="mt-3 flex h-20 items-end gap-1.5">
        {counts.map((count, index) => (
          <div
            key={index}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
            className="flex-1 cursor-default rounded-sm transition-opacity"
            style={{
              backgroundColor: palette[index],
              // zero-count bar still needs a sliver to stay hoverable.
              height: `${Math.max((count / tallest) * 100, 4)}%`,
              opacity: hovered === null || hovered === index ? 1 : 0.45,
            }}
          />
        ))}
      </div>
    </>
  );
}
