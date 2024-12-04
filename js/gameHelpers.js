export class TreeNode {
  node;
  children;
  constructor(node) {
    this.node = node;
  }
  addChild(node) {
    this.children.push(node);
  }
}
export class GameTree {
  rootNode;
  constructor(rootNode) {
    this.rootNode = rootNode;
  }
  printTree(node, depth = 0) {
    if (!node) return;
    console.log(`Depth ${depth}`);
    console.dir(JSON.parse(JSON.stringify(node.children)));
    node.children.forEach((child) => this.printTree(child, depth + 1));
  }
}

const generateAllNextPossibleMoves = (hex) => {
  const directions = ["n", "ne", "nw", "s", "se", "sw"];
  return directions.map((direction) => {
    return { hex: hex.generateNextHex(direction), direction };
  });
};
export const generateAllNextAllowedPossibleMovesAI = (gameArray, player) => {
  //!1) Get all enemy played hexObjs
  const enemyPlayedHexObjs = gameArray.filter(
    (hexObj) => hexObj.player != player
  );
  const playerPlayedHexObjs = gameArray.filter(
    (hexObj) => hexObj.player == player
  );
  //!2) Generate all possible moves from the played enemy cards
  const allPossibleMovesFromEnemy = enemyPlayedHexObjs.map(
    (enemyPlayedHexObj) => {
      return {
        possibleMoves: generateAllNextPossibleMoves(enemyPlayedHexObj.hex),
        startHexObj: enemyPlayedHexObj,
      };
    }
  );
  const allPossibleMovesFromPlayer = playerPlayedHexObjs.map(
    (playerPlayedHexObj) => {
      return {
        possibleMoves: generateAllNextPossibleMoves(playerPlayedHexObj.hex),
        startHexObj: playerPlayedHexObj,
      };
    }
  );

  //!3) Exclude the moves which have been already played by any of the players
  allPossibleMovesFromEnemy.forEach((possibleMoveObj) => {
    possibleMoveObj.possibleMoves = possibleMoveObj.possibleMoves.filter(
      (possibleMove) =>
        !gameArray
          .map((hexObj) => hexObj.hex.coordinates)
          .includes(possibleMove.hex.coordinates)
    );
  });

  allPossibleMovesFromPlayer.forEach((possibleMoveObj) => {
    possibleMoveObj.possibleMoves = possibleMoveObj.possibleMoves.filter(
      (possibleMove) =>
        !gameArray
          .map((hexObj) => hexObj.hex.coordinates)
          .includes(possibleMove.hex.coordinates)
    );
  });

  //!4) Exclude the intersection between both players

  allPossibleMovesFromPlayer.forEach((possibleMoveObj) => {
    possibleMoveObj.possibleMoves = possibleMoveObj.possibleMoves.filter(
      (possibleMove) =>
        !allPossibleMovesFromEnemy
          .flatMap((possibleEnemyMove) => possibleEnemyMove.possibleMoves)
          .map((possibleEnemyMoves) => possibleEnemyMoves.hex.coordinates)
          .includes(possibleMove.hex.coordinates)
    );
  });
  //!6) Filter the duplicate possible moves
  //? yes to remove duplicates, and no we cant use it because this is a nested object
  const visited = [];
  allPossibleMovesFromPlayer.forEach(
    (possibleMoveObj) =>
      (possibleMoveObj.possibleMoves = possibleMoveObj.possibleMoves.filter(
        (hexDirectionObj) => {
          if (
            !visited.some((visitedHexDirectionObj) =>
              visitedHexDirectionObj.hex.isEqual(hexDirectionObj.hex)
            )
          ) {
            visited.push(hexDirectionObj);
            return hexDirectionObj;
          }
        }
      ))
  );

  return allPossibleMovesFromPlayer;
};
const generateAllNextPossibleHexes = (hex) => {
  const directions = ["n", "ne", "nw", "s", "se", "sw"];
  return directions.map((direction) => {
    return hex.generateNextHex(direction);
  });
};
export const generateAllowedPlacements = (gameArray, player) => {
  //!1) Get all possible placements for all pieces in game array
  //? pieces -> adjacent -> check if your adjacent spots are also adjacent to the opponent
  //? O(n*6*n) => O(n^2)
  const enemyAdjacents = new Map(); //! opponentStartHexObj -> [adjacent moves]
  const occupiedPiecesMap = new Map();
  const allPossiblePlacements = gameArray.flatMap((hexObj) => {
    const possiblePlacement = generateAllNextPossibleHexes(hexObj.hex);

    if (hexObj.player !== player)
      for (const hex of possiblePlacement)
        enemyAdjacents.set(hex.coordinates, 1);

    occupiedPiecesMap.set(hexObj.hex.coordinates, 1);
    return possiblePlacement;
  });
  const allowedMovesHashMap = new Map();
  allPossiblePlacements.forEach((hex) => {
    //! This possible placement must not be
    //!1) Not adjacent to an enemy (i.e not inside the enemyAdjacents map)
    //!2) Not present in the occupiedPiecesMap
    if (
      !occupiedPiecesMap.has(hex.coordinates) &&
      !enemyAdjacents.has(hex.coordinates) &&
      !allowedMovesHashMap.has(hex.coordinates)
    )
      allowedMovesHashMap.set(hex.coordinates, hex);
  });
  return [...allowedMovesHashMap.values()];
};
