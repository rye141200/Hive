import {
  Hex,
  canMoveBreadthFirstSearch,
  isAdjacent,
  isOccupied,
  canSlide,
  getNeighbors,
  isInContact,
  areHexesAdjacent,
  areThreeHexesInRow,
  areFourHexesInRow,
} from "/js/Insects/hex.js";
export class QueenHex extends Hex {
  player;
  constructor(q, r, player) {
    super(q, r);
    this.player = player;
  }
  generateNextHex(direction) {
    return super.generateNextHex(direction);
  }
  generateAllowedPossibleMoves(gameArray) {
    //!1) After you move, are the original hex's neighbors adjacent to any of the placed items?
    // if (!canMoveBreadthFirstSearch(gameArray, this)) return [];

    //!2) Construct all possible moves from the current hex
    const directions = ["n", "s", "ne", "nw", "se", "sw"];
    const allPossibleMoves = directions.map((direction) => {
      return { hex: this.generateNextHex(direction), direction };
    });
    const gameArrayDeepCopy = gameArray.filter(
      (hexObj) => !hexObj.hex.isEqual(this)
    );
    //!3) Filter the new Hexes so that they don't violate any of the three main constraints
    const allowedMoves = allPossibleMoves.filter(
      (possibleMove) =>
        isAdjacent(gameArray, possibleMove) &&
        !isOccupied(gameArray, possibleMove) &&
        canSlide(possibleMove.hex, this, gameArrayDeepCopy) &&
        isInContact(
          getNeighbors(gameArray, possibleMove.hex),
          getNeighbors(gameArray, this)
        )
    );

    return allowedMoves.map((hexDirectionObj) => hexDirectionObj.hex);
  }
}
