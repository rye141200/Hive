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
  isInContact,
} from "/js/hex.js";
export class BeetleHex extends Hex {
  player;
  constructor(q, r, player) {
    super(q, r);
    this.player = player;
  }
  generateNextHex(direction) {
    return super.generateNextHex(direction);
  }
  generateAllowedPossibleMoves(gameArray) {
    if (!canMoveBreadthFirstSearch(gameArray, this)) return null;

    const directions = ["n", "s", "ne", "nw", "se", "sw"];
    const allPossibleMoves = directions.map((direction) => {
      return { hex: this.generateNextHex(direction), direction };
    });

    const allowedMoves = allPossibleMoves.filter(
      (possibleMove) =>
        isAdjacent(gameArray, possibleMove) &&
        isInContact(
          getNeighbors(gameArray, possibleMove.hex),
          getNeighbors(gameArray, this)
        )
    );
    // console.log(allowedMoves);
    return allowedMoves;
  }
}
