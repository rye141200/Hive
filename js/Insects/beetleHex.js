import {
  Hex,
  canMoveBreadthFirstSearch,
  isAdjacent,
  isPossibleMoveAdjacent,
  isOccupied,
  canSlide,
  canPhysicallySlide,
  getNeighbors,
  areHexesAdjacent,
  areThreeHexesInRow,
  areFourHexesInRow,
  isInContact,
} from "/js/Insects/hex.js";

export class BeetleHex extends Hex {
  player;
  constructor(q, r, player) {
    super(q, r);
    this.player = player;
  }
  //! Get the neighbors occupying the place where the beetle will step on
  getPieceBeetleStacksOn = (possibleMoveHexDirectionObj, gameArray) =>
    getNeighbors(gameArray, this)
      .filter((hexObj) => hexObj.hex.isEqual(possibleMoveHexDirectionObj.hex))
      .sort((a, b) => b.hex.stack - a.hex.stack)[0];

  generateNextHex(direction) {
    return super.generateNextHex(direction);
  }
  isBeetleHighestInTheRoom(gameArray) {
    return gameArray
      .filter((innerHexObj) => innerHexObj.hex.isEqual(this))
      .every((hexObj) => this.stack >= hexObj.hex.stack);
  }
  generateAllowedPossibleMoves(gameArray) {
    const breakTheHive = !canMoveBreadthFirstSearch(gameArray, this);
    if (breakTheHive && this.stack === 0) return [];
    if (breakTheHive && !this.isBeetleHighestInTheRoom(gameArray)) return [];

    const directions = ["n", "s", "ne", "nw", "se", "sw"];
    const allPossibleMoves = directions.map((direction) => {
      return { hex: this.generateNextHex(direction), direction };
    });

    let allowedMoves = allPossibleMoves.filter((possibleMove) => {
      if (this.stack > 0) {
        const occupiedPiece = this.getPieceBeetleStacksOn(
          possibleMove,
          gameArray
        );
        if (occupiedPiece) possibleMove.hex.stack = occupiedPiece.hex.stack + 1;
        return true;
      } else {
        const isAdjacent = isPossibleMoveAdjacent(
          gameArray,
          possibleMove.hex,
          this
        );
        if (isAdjacent && !isOccupied(gameArray, possibleMove))
          return canSlide(possibleMove.hex, this, gameArray);
        else {
          //! Get occupied neighbor stack number, then increment it by one
          const occupiedPiece = this.getPieceBeetleStacksOn(
            possibleMove,
            gameArray
          );
          if (occupiedPiece)
            possibleMove.hex.stack = occupiedPiece.hex.stack + 1;
          return isAdjacent;
        }
      }
    });
    allowedMoves = allowedMoves.map((hexDirectionObj) => hexDirectionObj.hex);
    //! Add beetle neighbors if filtered out by the isInContact method
    // console.log(allowedMoves);
    return allowedMoves;
  }
}
