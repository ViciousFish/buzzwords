export default interface Cell {
  q: number;
  r: number;
  value: string;
  capital: boolean;
  /** player index (0|1) or 2 for neutral
   * TODO: migrate to non-int value to support arbitrary # of players */
  owner: 0 | 1 | 2;
}

export const makeCell = (q: number, r: number): Cell => ({
  q,
  r,
  capital: false,
  owner: 2,
  value: "",
});
