export class Hex {
  q;
  r;
  s;
  coordinates;
  constructor(q, r) {
    this.q = q;
    this.r = r;
    this.s = -q - r;
    if (q + r + this.s != 0) return null;
    this.coordinates = `(${q},${r})`;
  }
  isEqual = (otherHex) => this.q == otherHex.q && this.r == otherHex.r;

  generateNextHex = (direction) => {
    if (direction == "ne") return new Hex(this.q + 1, this.r - 1);
    else if (direction == "n") return new Hex(this.q, this.r - 1);
    else if (direction == "se") return new Hex(this.q + 1, this.r);
    else if (direction == "s") return new Hex(this.q, this.r + 1);
    else if (direction == "nw") return new Hex(this.q - 1, this.r);
    else if (direction == "sw") return new Hex(this.q - 1, this.r + 1);
    else return null;
  };
  printHex = () => console.log(`(${this.q},${this.r},${this.s})`);
}

// const hexOne = new Hex(0, 0);
// hexOne.generateNextHex("ne").printHex();
// hexOne.generateNextHex("se").printHex();
// hexOne.generateNextHex("s").printHex();
// hexOne.generateNextHex("sw").printHex();
// hexOne.generateNextHex("nw").printHex();
// hexOne.generateNextHex("n").printHex();
// hexOne.generateNextHex("nigga")?.printHex();
