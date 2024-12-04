import { isImmobilized } from "/js/Insects/hex.js";
import {
  Hex,
  canMoveBreadthFirstSearch,
  isAdjacent,
  isOccupied,
  canSlide,
  getNeighbors,
} from "/js/Insects/hex.js";

export class AntHex extends Hex {
  player;
  constructor(q, r, player) {
    super(q, r);
    this.player = player;
  }

  generateAllPossibleAllowedNextHex(gameArray, hex, allowedMoves, startHex) {
    const directions = ["n", "s", "ne", "nw", "se", "sw"];
    const allPossibleMoves = directions.map((direction) => {
      return { hex: super.generateNextHex(direction, hex), direction };
    });

    //!possibleMove.hex.isEqual(hex)
    //isInContact(
    //  getNeighbors(gameArray, possibleMove.hex),
    //  getNeighbors(gameArray, this)
    //)
    //? In case of problems deep copy this shit
    const gameArrayFiltered = gameArray.filter(
      (hexObj) => !hexObj.hex.isEqual(this)
    );

    return allPossibleMoves.filter(
      (possibleMove) =>
        isAdjacent(gameArrayFiltered, possibleMove) &&
        !isOccupied(gameArray, possibleMove) &&
        !allowedMoves.some((move) => move.hex.isEqual(possibleMove.hex)) &&
        !startHex.isEqual(possibleMove.hex) &&
        canSlide(possibleMove.hex, hex, gameArrayFiltered)
    );
  }
  generateAntAllowedMoves(gameArray) {
    const queue = [];
    const allowedMoves = [];
    //?1) Change allowedMoves to be a set
    const pushToAllowedMovesSet = (allowedMoves, currentNode) => {
      if (!allowedMoves.some((move) => move.hex.isEqual(currentNode.hex)))
        allowedMoves.push(currentNode);
    };
    const possibleMoves = this.generateAllPossibleAllowedNextHex(
      gameArray,
      this,
      allowedMoves,
      this
    );

    possibleMoves.forEach((move) => queue.push(move));

    while (queue.length !== 0) {
      const currentNode = queue.shift();

      /* if (allowedMoves.some((move) => move.hex.isEqual(currentNode.hex))) break; */
      pushToAllowedMovesSet(allowedMoves, currentNode);
      const possibleMoves = this.generateAllPossibleAllowedNextHex(
        gameArray,
        currentNode.hex,
        allowedMoves,
        this
      );

      possibleMoves.forEach((move) => queue.push(move));
    }

    return allowedMoves;
  }
  generateAllowedPossibleMoves(gameArray) {
    // if (!canMoveBreadthFirstSearch(gameArray, this)) return [];

    const allowedMoves = this.generateAntAllowedMoves(gameArray);

    return allowedMoves.map((hexDirectionObj) => hexDirectionObj.hex);
  }
}
