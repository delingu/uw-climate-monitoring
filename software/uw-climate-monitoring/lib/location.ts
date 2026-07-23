export interface Location {
  building: string;
  floor: number;
  room: number;
}

// builds location id for storing in db
// eg. PSE-4-4417
export function locationId({ building, floor, room }: Location): string {
  return `${building}-${floor}-${room}`;
}

// "PSE-4-4417" -> "4417"
export function roomNumberFromId(id: string): string {
  return id.split("-")[2] ?? id;
}

export function formatLocation({ building, floor }: Location): string {
  return `${building} ${floor}th Floor`;
}
