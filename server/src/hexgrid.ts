import Cell from "./cell";

const QRLookup = (q: number): number => {
  switch (q) {
    case -3:
      return -1;
    case -2:
    case -1:
      return -2;
    case 0:
    case 1:
      return -3;
    case 2:
    case 3:
      return -4;

    default:
      throw new Error("invalid Q value");
  }
};

export default class HexGrid {
  cellMap: {
    [key: string]: Cell;
  };
  constructor() {
    this.cellMap = {};
    for (let q = -3; q <= 3; q++) {
      const rMin = QRLookup(q);
      const rMax = rMin + (q % 2) == 0 ? 7 : 6;
      for (let r = rMin; r <= rMax; r++) {
        const cell = new Cell(q, r);
        this.cellMap[`${q},${r}`] = cell;
      }
    }
  }

  getCell(q: number, r: number): Cell | null {
    return this.cellMap[`${q},${r}`];
  }

  setCell(cell: Cell): void {
    this.cellMap[`${cell.q},${cell.r}`] = cell;
  }

  getCellNeighbors(q: number, r: number): Cell[] {
    const potentialNeighbors = [
      this.cellMap[`${q - 1},${r}`],
      this.cellMap[`${q - 1},${r + 1}`],
      this.cellMap[`${q},${r - 1}`],
      this.cellMap[`${q},${r + 1}`],
      this.cellMap[`${q + 1},${r - 1}`],
      this.cellMap[`${q + 1},${r}`],
    ];

    return potentialNeighbors.filter((cell) => Boolean(cell));
  }
}
