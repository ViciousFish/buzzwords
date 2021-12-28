export default interface Cell {
  q: number;
  r: number;
  value: string;
  capital: boolean;
  owner: 0 | 1 | 2;
}

export const makeCell = (q: number, r: number): Cell => ({
  q,
  r,
  capital: false,
  owner: 2,
  value: "",
});
