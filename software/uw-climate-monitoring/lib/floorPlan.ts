import { Location, locationId } from "@/lib/location";

// coordinates are in viewBox units not pixels so the ratio stays the same

export type ShapeKind = "room" | "stairs" | "restroom" | "elevator" | "wall";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FloorShape {
  kind: ShapeKind;
  // set room number if room is a "room" kind only
  room?: number;
  // A rect for rectangular rooms, or points ("x,y x,y ...")
  // point format is clockwise
  // walls use points as an open run along the wall centreline
  rect?: Rect;
  points?: string;
}

export interface FloorPlan {
  building: string;
  floor: number;
  // [minX, minY, width, height]
  viewBox: [number, number, number, number];
  shapes: FloorShape[];
}

export const PSE_FLOOR_4: FloorPlan = {
  building: "PSE",
  floor: 4,
  viewBox: [0, 0, 1315, 672],
  shapes: [
    // classrooms
    {
      kind: "room",
      room: 4043,
      rect: { x: 69, y: 118, width: 255, height: 214 },
    },
    {
      kind: "room",
      room: 4053,
      rect: { x: 323, y: 118, width: 255, height: 214 },
    },
    {
      kind: "room",
      room: 4417,
      rect: { x: 863, y: 118, width: 255, height: 214 },
    },
    {
      kind: "room",
      room: 4433,
      rect: { x: 1118, y: 118, width: 177, height: 108 },
    },
    {
      kind: "room",
      room: 4437,
      rect: { x: 1118, y: 225, width: 177, height: 108 },
    },
    // stairs
    { kind: "stairs", rect: { x: 11, y: 9, width: 141, height: 75 } },
    { kind: "stairs", rect: { x: 11, y: 360, width: 141, height: 75 } },
    { kind: "stairs", rect: { x: 418, y: 524, width: 141, height: 75 } },
    { kind: "stairs", rect: { x: 668, y: 524, width: 141, height: 75 } },
    // study rooms and offices
    { kind: "room", rect: { x: 184, y: 9, width: 379, height: 71 } },
    { kind: "room", rect: { x: 714, y: 9, width: 379, height: 71 } },
    { kind: "room", rect: { x: 192, y: 408, width: 113, height: 57 } },
    { kind: "room", rect: { x: 318, y: 408, width: 113, height: 57 } },
    { kind: "room", rect: { x: 445, y: 408, width: 113, height: 57 } },
    { kind: "room", rect: { x: 808, y: 408, width: 117, height: 57 } },
    { kind: "room", rect: { x: 935, y: 408, width: 61, height: 57 } },
    // restroom
    {
      kind: "restroom",
      points: "767,161 864,161 864,332 767,332 767,252 715,252 715,205 767,205",
    },
    //elevators
    { kind: "elevator", rect: { x: 715, y: 161, width: 52, height: 44 } },
    { kind: "elevator", rect: { x: 715, y: 252, width: 52, height: 80 } },
    // walls
    {
      kind: "wall",
      points:
        "563,44 715,44 715,10 1311,10 1311,496 1031,496 1031,661 65,661 65,434 12,434 12,10 563,10",
    },
    {
      kind: "wall",
      points: "66,434 558,434 558,661",
    },
    {
      kind: "wall",
      points: "668,661 668,454 1031,454 1031,496",
    },
  ],
};

// only rooms are clickable and colourable
export function isRoom(shape: FloorShape): boolean {
  return shape.kind === "room" && shape.room !== undefined;
}

export function roomIdFor(plan: FloorPlan, shape: FloorShape): string {
  const location: Location = {
    building: plan.building,
    floor: plan.floor,
    room: shape.room!,
  };

  return locationId(location);
}
