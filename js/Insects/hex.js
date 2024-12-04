export class Hex {
  q;
  r;
  s;
  coordinates;
  stack;
  constructor(q, r) {
    this.q = q;
    this.r = r;
    this.s = -q - r;
    if (q + r + this.s !== 0) throw new Error("Nigga");
    this.coordinates = `(${q},${r})`;
    this.stack = 0;
  }

  isEqual = (otherHex) => this.q == otherHex.q && this.r == otherHex.r;
  subtract = (otherHex) => new Hex(this.q - otherHex.q, this.r - otherHex.r);
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

  distanceTo(otherHex) {
    const dq = this.q - otherHex.q;
    const dr = this.r - otherHex.r;
    const distance = (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
    return distance;
  }
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
export const isPossibleMoveAdjacent = (
  gameArray,
  possibleMoveHex,
  originalHex
) => {
  return (
    getNeighbors(
      gameArray.filter((hexObj) => !hexObj.hex.isEqual(originalHex)),
      possibleMoveHex
    ).length > 0
  );
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

//! Given a possible move, get the neighbors of the originalHex you are coming from, if by any means, this possible move is adjacent to two of the neighbors at the same time then you cant slide

/*
 * Going north east -> q+1, r-1
 * Going south west -> q-1, r+1
 * Going north      -> q,   r-1
 * Going south      -> q,   r+1
 * Going north west -> q-1, r
 * Going south east -> q+1, r
 */
const getDirection = (neighborHex, originalHex) => {
  const differenceHex = neighborHex.subtract(originalHex);
  switch (`${differenceHex.q},${differenceHex.r}`) {
    case "1,-1":
      return "ne";
    case "-1,1":
      return "sw";
    case "0,-1":
      return "n";
    case "0,1":
      return "s";
    case "-1,0":
      return "nw";
    case "1,0":
      return "se";
  }
};

//* O(n)
export const canPhysicallySlide = (originalHex, gameArray) => {
  let neighbors = getNeighbors(gameArray, originalHex)
    .map((neighbor) => neighbor.hex)
    .filter((neighborHex) => neighborHex.stack === 0);

  if (neighbors.length === 1) return true;
  if (neighbors.length === 2) return true;
  if (neighbors.length === 5 || neighbors.length === 6) return false;
  if (
    gameArray.some(
      (hexObj) =>
        hexObj.insectName === "beetle" && hexObj.hex.isEqual(originalHex)
    )
  )
    return false;
  neighbors = neighbors.map((neighborHex) => {
    return {
      neighborHex,
      direction: getDirection(neighborHex, originalHex),
    };
  });
  // to slide at direction n => at most one neighbor nw or ne
  // get array of available directions to slide at
  //! 3, 4, 5, 6
  const directions = ["nw", "n", "ne", "se", "s", "sw"];
  const allowedDirections = directions.filter(
    (direction) =>
      !neighbors.some((neighbor) => neighbor.direction == direction)
  ); // "n" "nw" "ne"
  let realAllowedDirections = [];
  for (let i = 0; i < allowedDirections.length; i++) {
    const directionIndex = directions.indexOf(allowedDirections[i]);
    const rightDirection = directions[(directionIndex + 1) % 6];
    const leftDirection = directions[(directionIndex - 1) % 6];
    if (
      allowedDirections.indexOf(leftDirection) === -1 &&
      allowedDirections.indexOf(rightDirection) === -1
    )
      realAllowedDirections.push(allowedDirections[i]);
  }

  return realAllowedDirections.length > 0;
};
export const isImmobilized = (originalHex, gameArray) =>
  !canPhysicallySlide(originalHex, gameArray) ||
  !canMoveBreadthFirstSearch(gameArray, originalHex);

//* O(n)
export const canSlide = (possibleMoveHex, originalHex, gameArray) => {
  //?1) Get the neighbors of the originalHex
  const neighbors = getNeighbors(gameArray, originalHex)
    .map((neighbor) => neighbor.hex)
    .filter((neighborHex) => neighborHex.stack === 0);
  if (neighbors.length === 1) return true;
  if (
    gameArray.some(
      (hexObj) =>
        hexObj.insectName === "beetle" &&
        hexObj.hex.isEqual(originalHex) &&
        originalHex.stack < hexObj.hex.stack
    )
  )
    return false;
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
  if (neighbors.length === 4)
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

//* O(b^d), b-> branching factor,d -> depth
export function canMoveBreadthFirstSearch(gameArray, originalHex) {
  //!0) get all pieces of the same coordinates of originalHex
  /* const arrayOfSameCoordinates = gameArray.reduce((acc,hexObj)=> acc + hexObj.hex.isEqual(originalHex) == true ? 1 : 0 , 0);
   */
  const arrayOfSameCoordinates = gameArray.filter((hexObj) =>
    hexObj.hex.isEqual(originalHex)
  );
  //! [1,2,3]
  if (arrayOfSameCoordinates.length > 1)
    for (let i = 0; i < arrayOfSameCoordinates.length; i++)
      if (arrayOfSameCoordinates[i].hex.stack > originalHex.stack) return false;

  //!1) Get all neighbors of the current piece
  const neighbors = getNeighbors(gameArray, originalHex)
    .map((neighbor) => neighbor.hex)
    .filter((neighborHex) => neighborHex.stack === 0);

  //! This would never happen just for safety if UI doesn't update correct
  if (neighbors.length === 0) return false;

  if (neighbors.length === 1) return true;
  if (neighbors.length === 5 || neighbors.length == 6) return false;
  //!2) Deep copy game array without originalHex
  const gameArrayDeepCopy = gameArray.filter(
    (hexObj) => !hexObj.hex.isEqual(originalHex) && hexObj.hex.stack === 0
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
          !visited.some((hex) => hex.isEqual(possibleMove))
      )
      .forEach((possibleMove) => queue.push(possibleMove));
  }
  const realVisitedNodes = [];
  visited.forEach((visitedNode) => {
    if (
      !realVisitedNodes
        .map((node) => node.coordinates)
        .includes(visitedNode.coordinates)
    )
      realVisitedNodes.push(visitedNode);
  });
  //! Visited is the same length as the original game array + EVERY SINGLE NEIGHBOR IS IN VISITED
  //! .isEqual()
  let neighborsDiscoveredInVisitedArray = 0;
  for (let i = 0; i < realVisitedNodes.length; i++)
    for (let j = 0; j < neighbors.length; j++)
      neighborsDiscoveredInVisitedArray += realVisitedNodes[i].isEqual(
        neighbors[j]
      )
        ? 1
        : 0;

  return (
    realVisitedNodes.length === gameArrayDeepCopy.length &&
    neighborsDiscoveredInVisitedArray === neighbors.length
  );
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
