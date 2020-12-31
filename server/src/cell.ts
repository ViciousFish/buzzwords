export default class Cell {
  q: number;
  r: number;
  value: string;
  capital: boolean;
  owner: 0 | 1 | 2;
  constructor(q: number, r: number) {
    this.q = q;
    this.r = r;
    this.capital = false;
    this.owner = 2;
    this.value = "";
  }
}
