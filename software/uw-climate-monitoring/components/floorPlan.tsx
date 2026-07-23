"use client";

import * as React from "react";
import { PreviewCard } from "@base-ui/react/preview-card";
import { Popover } from "@base-ui/react/popover";
import { MdElevator } from "react-icons/md";
import { MdStairs } from "react-icons/md";
import { Toilet } from "griddy-icons";

import {
  FloorPlan,
  FloorShape,
  ShapeKind,
  isRoom,
  roomIdFor,
} from "@/lib/floorPlan";
import { NO_DATA } from "@/lib/scales";

const KIND_FILL: Record<ShapeKind, string> = {
  room: "#e5e5e5",
  stairs: "#e5e5e5",
  restroom: "#e5e5e5",
  elevator: "#e5e5e5",
  wall: "none",
};

const OUTLINE = "#d4d4d4";

// SVG has no z-index: paint order is document order
// draw walls first so they are under rooms
function orderedShapes(shapes: FloorShape[]) {
  return shapes
    .map((shape, index) => ({ shape, index }))
    .sort(
      (a, b) =>
        Number(b.shape.kind === "wall") - Number(a.shape.kind === "wall"),
    );
}

export interface FloorPlanProps {
  plan: FloorPlan;
  // optional: not room kind rooms are not filled
  roomColors?: Record<string, string>;
  // hover card contents for a room
  roomCard?: (roomId: string) => React.ReactNode;
  // for showing the room bounds in dev
  showBounds?: boolean;
}

export default function FloorPlanMap({
  plan,
  roomColors,
  roomCard,
  showBounds,
}: FloorPlanProps) {
  const [minX, minY, width, height] = plan.viewBox;

  const handle = React.useMemo(() => PreviewCard.createHandle<string>(), []);

  // clicked "pinned" cards are independent of hover cards
  const [pinned, setPinned] = React.useState<{
    roomId: string;
    anchor: Element;
  } | null>(null);

  const fillFor = (shape: FloorShape) => {
    if (!roomColors || !isRoom(shape)) {
      return KIND_FILL[shape.kind];
    }

    return roomColors[roomIdFor(plan, shape)] ?? NO_DATA;
  };

  return (
    <>
      <svg viewBox={plan.viewBox.join(" ")} className="w-full h-auto">
        {showBounds ? (
          <rect
            x={minX}
            y={minY}
            width={width}
            height={height}
            fill="none"
            stroke={OUTLINE}
            strokeDasharray="8 8"
          />
        ) : null}

        {orderedShapes(plan.shapes).map(({ shape, index }) => {
          const drawn = <Shape shape={shape} fill={fillFor(shape)} />;

          if (!roomCard || !isRoom(shape)) {
            return <React.Fragment key={index}>{drawn}</React.Fragment>;
          }

          const roomId = roomIdFor(plan, shape);

          return (
            <PreviewCard.Trigger
              key={index}
              handle={handle}
              payload={roomId}
              delay={120}
              render={<g />}
              onClick={(event) =>
                setPinned({ roomId, anchor: event.currentTarget })
              }
            >
              {drawn}
            </PreviewCard.Trigger>
          );
        })}
      </svg>

      {roomCard ? (
        <PreviewCard.Root handle={handle}>
          {({ payload }) =>
            payload ? (
              <PreviewCard.Portal>
                <PreviewCard.Positioner side="top" sideOffset={8}>
                  <PreviewCard.Popup className="rounded-xl outline-none">
                    {roomCard(payload)}
                  </PreviewCard.Popup>
                </PreviewCard.Positioner>
              </PreviewCard.Portal>
            ) : null
          }
        </PreviewCard.Root>
      ) : null}

      {roomCard ? (
        <Popover.Root
          open={pinned !== null}
          onOpenChange={(open) => {
            if (!open) {
              setPinned(null);
            }
          }}
        >
          <Popover.Portal>
            <Popover.Positioner
              anchor={pinned?.anchor}
              side="top"
              sideOffset={8}
            >
              <Popover.Popup className="rounded-xl outline-none">
                {pinned ? roomCard(pinned.roomId) : null}
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      ) : null}
    </>
  );
}

function Shape({ shape, fill }: { shape: FloorShape; fill: string }) {
  if (shape.kind === "wall") {
    return shape.points ? (
      <polyline
        points={shape.points}
        fill="none"
        stroke={OUTLINE}
        strokeWidth={2}
        strokeLinecap="square"
      />
    ) : null;
  }

  if (shape.kind == "restroom") {
    return (
      <g>
        <polygon points={shape.points} fill={fill} stroke={OUTLINE} />
        {shape.kind === "restroom" ? (
          <g transform="translate(803.5 234.5)">
            <Toilet size={24} filled color="#A7A7A7" />
          </g>
        ) : null}
      </g>
    );
  }

  if (!shape.rect) {
    return null;
  }

  const { x, y, width, height } = shape.rect;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke={OUTLINE}
        className={`transition-[fill] duration-300 ${
          isRoom(shape) ? "cursor-pointer" : ""
        }`}
      />

      {isRoom(shape) ? (
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#525252"
          fontSize={18}
          fontWeight={600}
        >
          {shape.room}
        </text>
      ) : shape.kind == "elevator" ? (
        <g transform={`translate(${centerX - 12} ${centerY - 12})`}>
          <MdElevator size={24} fill="#A7A7A7" />
        </g>
      ) : shape.kind == "stairs" ? (
        <g transform={`translate(${centerX - 12} ${centerY - 12})`}>
          <MdStairs size={24} fill="#A7A7A7" />
        </g>
      ) : null}
    </g>
  );
}
