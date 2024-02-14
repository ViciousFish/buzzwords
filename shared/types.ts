export interface HexCoord {
  q: number;
  r: number;
}

export function HexCoordKey(coord: HexCoord): string {
  return `${coord.q},${coord.r}`
}