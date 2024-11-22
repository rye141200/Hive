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

  generateNextHex(direction, hex = this) {
    if (direction == "ne") return new Hex(hex.q + 1, hex.r - 1);
    else if (direction == "n") return new Hex(hex.q, hex.r - 1);
    else if (direction == "se") return new Hex(hex.q + 1, hex.r);
    else if (direction == "s") return new Hex(hex.q, hex.r + 1);
    else if (direction == "nw") return new Hex(hex.q - 1, hex.r);
    else if (direction == "sw") return new Hex(hex.q - 1, hex.r + 1);
    else return null;
  }
  generateAllAdjacentMoves = () => {
    const directions = ["n", "s", "ne", "nw", "se", "sw"];
    return directions.map((direction) => {
      return this.generateNextHex(direction);
    });
  };
  printHex = () => console.log(`(${this.q},${this.r},${this.s})`);
}
export const isInContact = (possibleNeighbors, currentNeighbors) =>
  possibleNeighbors.some((possibleNeighbor) =>
    currentNeighbors.some((currentNeighbor) =>
      currentNeighbor.hex.isEqual(possibleNeighbor.hex)
    )
  );

//! General movement rules:
//! 1) You cant move a piece to another piece's place unless it is a beetle (beetles can stack up on pieces)
//! 2) You can't move to a direction which is surrounded in the center by two other directions (i.e if north is occupied and south east is occupied, you cant move to north east)
//! 3) You cant move the piece if you'r surrounded by 5 tiles
//! 4) if you can remove tile and don't break hive then you can move it
//? Don't break the hive rule
export const isAdjacent = (gameArray, hexDirectionObject) => {
  const allPlacedHexes = gameArray.map((hexObj) => hexObj.hex);
  return hexDirectionObject.hex
    .generateAllAdjacentMoves()
    .some((hex) => allPlacedHexes.some((placedHex) => placedHex.isEqual(hex)));
};
//? You can't replace a placed piece unless you are a beetle, you stack
export const isOccupied = (gameArray, hexDirectionObject) => {
  const allPlacedHexes = gameArray.map((hexObj) => hexObj.hex);
  return allPlacedHexes.some((placedHex) =>
    placedHex.isEqual(hexDirectionObject.hex)
  );
};

export function getNeighbors(gameArray, hex) {
  const allPossibleMovesFromOriginalHex = hex.generateAllAdjacentMoves();

  return gameArray.filter((hexObj) =>
    allPossibleMovesFromOriginalHex.some((possibleMoves) =>
      possibleMoves.isEqual(hexObj.hex)
    )
  );
}
export const areHexesAdjacent = (hexOne, hexTwo) =>
  Math.abs(hexOne.q - hexTwo.q) +
    Math.abs(hexOne.r - hexTwo.r) +
    Math.abs(hexOne.s - hexTwo.s) ===
  2;
export const areThreeHexesInRow = (hexOne, hexTwo, hexThree) =>
  (areHexesAdjacent(hexOne, hexTwo) && areHexesAdjacent(hexTwo, hexThree)) ||
  (areHexesAdjacent(hexTwo, hexOne) && areHexesAdjacent(hexOne, hexThree)) ||
  (areHexesAdjacent(hexOne, hexThree) && areHexesAdjacent(hexThree, hexTwo));

export const areFourHexesInRow = (hexOne, hexTwo, hexThree, hexFour) =>
  (areThreeHexesInRow(hexOne, hexTwo, hexThree) &&
    (areHexesAdjacent(hexOne, hexFour) ||
      areHexesAdjacent(hexThree, hexFour) ||
      areHexesAdjacent(hexTwo, hexFour))) ||
  (areThreeHexesInRow(hexOne, hexTwo, hexFour) &&
    (areHexesAdjacent(hexThree, hexOne) ||
      areHexesAdjacent(hexThree, hexTwo) ||
      areHexesAdjacent(hexThree, hexFour))) ||
  (areThreeHexesInRow(hexOne, hexThree, hexFour) &&
    (areHexesAdjacent(hexTwo, hexOne) ||
      areHexesAdjacent(hexTwo, hexThree) ||
      areHexesAdjacent(hexTwo, hexFour))) ||
  (areThreeHexesInRow(hexTwo, hexThree, hexFour) &&
    (areHexesAdjacent(hexOne, hexTwo) ||
      areHexesAdjacent(hexOne, hexThree) ||
      areHexesAdjacent(hexOne, hexFour)));

//! Given a possible move, get the neighbors of the originalHex you are coming from, if by any means, this neighbor is adjacent to two of the neighbors at the same time then you cant slide
export const canSlide = (possibleMoveHex, originalHex, gameArray) => {
  //?1) Get the neighbors of the originalHex
  const neighbors = getNeighbors(gameArray, originalHex).map(
    (neighbor) => neighbor.hex
  );
  if (neighbors.length === 1) return true;
  if (neighbors.length === 2)
    return !(
      areHexesAdjacent(neighbors[0], possibleMoveHex) &&
      areHexesAdjacent(possibleMoveHex, neighbors[1])
    );
  /* 
    (!areHexesAdjacent(neighbors[0], neighbors[1]) &&
        !areHexesAdjacent(neighbors[0], neighbors[2]) &&
        !areHexesAdjacent(neighbors[1], neighbors[2])) ||
  */
  if (neighbors.length === 3)
    return (
      !(
        areHexesAdjacent(neighbors[0], possibleMoveHex) &&
        areHexesAdjacent(possibleMoveHex, neighbors[1])
      ) &&
      !(
        areHexesAdjacent(neighbors[1], possibleMoveHex) &&
        areHexesAdjacent(possibleMoveHex, neighbors[2])
      ) &&
      !(
        areHexesAdjacent(neighbors[2], possibleMoveHex) &&
        areHexesAdjacent(possibleMoveHex, neighbors[0])
      )
    );
  /*
    !(
      ((areHexesAdjacent(neighbors[0], neighbors[1]) &&
        areHexesAdjacent(neighbors[2], neighbors[3])) ||
        (areHexesAdjacent(neighbors[0], neighbors[3]) &&
          areHexesAdjacent(neighbors[1], neighbors[2])) ||
        (areHexesAdjacent(neighbors[0], neighbors[2]) &&
          areHexesAdjacent(neighbors[1], neighbors[3]))) &&
      !areFourHexesInRow(neighbors[0], neighbors[1], neighbors[2], neighbors[3])
    );
   */
  if (neighbors.length == 4)
    return (
      !(
        areHexesAdjacent(neighbors[0], possibleMoveHex) &&
        areHexesAdjacent(possibleMoveHex, neighbors[1])
      ) &&
      !(
        areHexesAdjacent(neighbors[0], possibleMoveHex) &&
        areHexesAdjacent(possibleMoveHex, neighbors[2])
      ) &&
      !(
        areHexesAdjacent(neighbors[0], possibleMoveHex) &&
        areHexesAdjacent(possibleMoveHex, neighbors[3])
      ) &&
      !(
        areHexesAdjacent(neighbors[1], possibleMoveHex) &&
        areHexesAdjacent(possibleMoveHex, neighbors[2])
      ) &&
      !(
        areHexesAdjacent(neighbors[1], possibleMoveHex) &&
        areHexesAdjacent(possibleMoveHex, neighbors[3])
      ) &&
      !(
        areHexesAdjacent(neighbors[2], possibleMoveHex) &&
        areHexesAdjacent(possibleMoveHex, neighbors[3])
      )
    );

  return false;
};
export function canMoveBreadthFirstSearch(gameArray, originalHex) {
  //!1) Get all neighbors of the current piece
  const neighbors = getNeighbors(gameArray, originalHex).map(
    (neighbor) => neighbor.hex
  );
  if (neighbors.length === 1) return true;
  if (neighbors.length === 5 || neighbors.length == 6) return false;
  //!2) Deep copy game array without originalHex
  const gameArrayDeepCopy = gameArray.filter(
    (hexObj) => !hexObj.hex.isEqual(originalHex)
  );
  //!3) Construct breadth first search, if one neighbor reaches all other neighbors then you can safely move without breaking the hive
  const neighbor = neighbors[0];
  const queue = [neighbor];
  const visited = [];
  while (queue.length !== 0) {
    const directions = ["n", "s", "ne", "nw", "se", "sw"];
    const currentNode = queue.shift();
    visited.push(currentNode);
    const possibleMoves = directions.map((direction) =>
      currentNode.generateNextHex(direction)
    );

    //! Only push the moves which are in the game array
    possibleMoves
      .filter(
        (possibleMove) =>
          gameArrayDeepCopy
            .map((arr) => arr.hex.coordinates)
            .includes(possibleMove.coordinates) &&
          !visited
            .map((node) => node.coordinates)
            .includes(possibleMove.coordinates)
      )
      .forEach((possibleMove) => queue.push(possibleMove));
    if (visited.length === gameArrayDeepCopy.length) return true;
  }
  return false;
}
function canMove(gameArray, originalHex) {
  //!1) Get all neighbors of the current piece
  const neighbors = getNeighbors(gameArray, originalHex);
  if (neighbors.length === 1) return true;
  if (neighbors.length === 5 || neighbors.length == 6) return false;
  if (neighbors.length === 2)
    return areHexesAdjacent(neighbors[0].hex, neighbors[1].hex);
  if (neighbors.length === 3)
    return areThreeHexesInRow(
      neighbors[0].hex,
      neighbors[1].hex,
      neighbors[2].hex
    );
  if (neighbors.length === 4)
    return areFourHexesInRow(
      neighbors[0].hex,
      neighbors[1].hex,
      neighbors[2].hex,
      neighbors[3].hex
    );
  return false; //? Neighbors are either 0 or more than six which is wrong
}
