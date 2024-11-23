import {
  Hex,
  canMoveBreadthFirstSearch,
  isAdjacent,
  isOccupied,
  canSlide,
  getNeighbors,
  areHexesAdjacent,
  areThreeHexesInRow,
  areFourHexesInRow,
} from "/js/hex.js";
export class GrasshopperHex extends Hex {
  player;
  constructor(q, r, player) {
    super(q, r);
    this.player = player;
  }
  generateNextHex(direction, hex = this) {
    if (direction == "ne") return new Hex(hex.q + 1, hex.r - 1);
    else if (direction == "n") return new Hex(hex.q, hex.r - 1);
    else if (direction == "se") return new Hex(hex.q + 1, hex.r);
    else if (direction == "s") return new Hex(hex.q, hex.r + 1);
    else if (direction == "nw") return new Hex(hex.q - 1, hex.r);
    else if (direction == "sw") return new Hex(hex.q - 1, hex.r + 1);
    else return null;
  }
  generateGrasshopperLandingPosition(
    startHexDirectionObject,
    gameArray,
    direction
  ) {
    let currentHexDirectionObject = {
      hex: this.generateNextHex(direction, startHexDirectionObject.hex),
      direction,
    };
    while (isOccupied(gameArray, currentHexDirectionObject)) {
      currentHexDirectionObject = {
        hex: this.generateNextHex(direction, currentHexDirectionObject.hex),
        direction,
      };
    }

    return !isOccupied(gameArray, currentHexDirectionObject) &&
      areHexesAdjacent(
        currentHexDirectionObject.hex,
        startHexDirectionObject.hex
      )
      ? startHexDirectionObject
      : currentHexDirectionObject;
  }
  generateAllowedPossibleMoves(gameArray) {
    if (!canMoveBreadthFirstSearch(gameArray, this)) return null;

    const directions = ["n", "s", "ne", "nw", "se", "sw"];
    const allPossibleMoves = directions.map((direction) =>
      this.generateGrasshopperLandingPosition(
        { hex: this, direction },
        gameArray,
        direction
      )
    );

    const allowedMoves = allPossibleMoves.filter(
      (possibleMove) => !possibleMove.hex.isEqual(this)
    );
    console.log(allowedMoves);
    return allowedMoves.map((hexObj) => hexObj.hex);
  }
}
