import { generateAllowedPlacements } from "/js/gameHelpers.js";
import { getNeighbors } from "/js/Insects/hex.js";
import { QueenHex } from "/js/Insects/queenHex.js";
import { BeetleHex } from "/js/Insects/beetleHex.js";
import { GrasshopperHex } from "/js/Insects/grasshopperHex.js";
import { AntHex } from "/js/Insects/antHex.js";
import { SpiderHex } from "/js/Insects/spiderHex.js";
import { Node } from "/js/AI/GameAlgorithms.js";
/*
 * hexObj has an attribute canMove for all pieces
 * canMove: is not pinned and can slide and doesn't break the hive
 */
export class Board {
  gameArray;
  constructor(gameArray) {
    this.gameArray = gameArray;
    this.timer = 0;
    this.visited = [];
    this.tin = [];
    this.low = [];
  }
  distanceFromQueen = (pieceHex, queenHex) =>
    (Math.abs(pieceHex.q - queenHex.q) +
      Math.abs(pieceHex.q + pieceHex.r - queenHex.q - queenHex.r) +
      Math.abs(pieceHex.r - queenHex.r)) /
    2;
  constructInsectObject = (insectToPlace, possiblePlacementHex) => {
    if (insectToPlace === "queen")
      return new QueenHex(possiblePlacementHex.q, possiblePlacementHex.r);
    else if (insectToPlace === "spider")
      return new SpiderHex(possiblePlacementHex.q, possiblePlacementHex.r);
    else if (insectToPlace === "grasshopper")
      return new GrasshopperHex(possiblePlacementHex.q, possiblePlacementHex.r);
    else if (insectToPlace === "beetle")
      return new BeetleHex(possiblePlacementHex.q, possiblePlacementHex.r);
    else if (insectToPlace === "ant")
      return new AntHex(possiblePlacementHex.q, possiblePlacementHex.r);
  };
  pushToBoard(hexObj) {
    this.gameArray.push(hexObj);
    //! Evaluate the immobility to the whole array
    this.updateCanMove();
  }
  popFromBoard() {
    this.gameArray.pop();
    this.updateCanMove();
  }
  mutateBoard(originalHex, possibleMoveHex, node) {
    //! To update a piece position
    const index = this.gameArray.findIndex((hexObj) => {
      return (
        hexObj.hex.isEqual(originalHex) &&
        hexObj.insectName === node.insectName &&
        hexObj.hex.stack === originalHex.stack
      );
    });
    this.gameArray[index].hex = possibleMoveHex;
    this.gameArray[index].type = this.constructInsectObject(
      this.gameArray[index].insectName,
      possibleMoveHex
    );
    this.gameArray[index].type.stack = possibleMoveHex.stack;
  }
  isQueenPlaced = (player) =>
    this.gameArray.some(
      (hexObj) => hexObj.insectName == "queen" && hexObj.player == player
    );
  getAllowedMovements = (player, gameArray) => {
    const isQueenPlaced = this.isQueenPlaced(player);
    const isOpponentQueenPlaced = this.isQueenPlaced(player === 1 ? 2 : 1);
    let allowedMovements = [];
    if (isQueenPlaced && isOpponentQueenPlaced)
      allowedMovements = gameArray
        .filter((hexObj) => hexObj.player === player && hexObj.canMove)
        .map((AIHexObj) => {
          return {
            originalPiece: AIHexObj,
            possibleMoves:
              AIHexObj.type.generateAllowedPossibleMoves(gameArray),
          };
        });
    return allowedMovements;
  };
  isWinningState = (opponent) => {
    const opponentQueen = this.gameArray.filter(
      (hexObj) => hexObj.insectName === "queen" && hexObj.player === opponent
    )[0];
    if (opponentQueen.adj.length >= 6) return true;
    return false;
  };
  mergeMovementsAndPlacement = (
    originalPlayer,
    player,
    gameArray,
    parentNode = null
  ) => {
    //!1) Get the allowed placements
    const allowedPlacements = generateAllowedPlacements(gameArray, player);

    //!2) Get the allowed movements if the queen has been played
    let allowedMovements = this.getAllowedMovements(player, gameArray);
    //!3) Get all possible placements
    const allMovementsMerged = this.getAvailablePieces(player).flatMap(
      (insectName) =>
        allowedPlacements.map(
          (allowedPlacementHex) =>
            new Node(
              allowedPlacementHex,
              null,
              insectName,
              player === originalPlayer ? -Infinity : Infinity,
              player,
              parentNode
            )
        )
    );

    allowedMovements
      .flatMap((allowedMove) =>
        allowedMove.possibleMoves.map(
          (possibleMoveHex) =>
            new Node(
              possibleMoveHex,
              allowedMove.originalPiece.hex,
              allowedMove.originalPiece.insectName,
              player === originalPlayer ? -Infinity : Infinity,
              player,
              parentNode
            )
        )
      )
      .forEach((node) => allMovementsMerged.push(node));

    //# priority in moves:
    //* 1) placement adjacent to enemy queen
    //* 2) movement adjacent to enemy queen
    //* 3) movement anywhere
    //* 4) placement anywhere
    const opponentQueen = gameArray.filter(
      (hexObj) => hexObj.insectName === "queen" && hexObj.player !== player
    )[0];
    //!1) Distance to the enemy queen
    if (opponentQueen)
      allMovementsMerged.sort((a, b) => {
        // First sort by whether originalPieceHex is null
        if (a.originalPieceHex === null && b.originalPieceHex !== null)
          return -1;
        if (a.originalPieceHex !== null && b.originalPieceHex === null)
          return 1;

        // If both have the same originalPieceHex status, sort by distance from queen
        const distanceDifference =
          this.distanceFromQueen(a.possibleMoveHex, opponentQueen.hex) -
          this.distanceFromQueen(b.possibleMoveHex, opponentQueen.hex);
        return distanceDifference;
      });

    return allMovementsMerged;
  };
  getAvailablePieces = (player) => {
    const piecesDictionary = {
      queen: 1,
      spider: 2,
      beetle: 2,
      ant: 3,
      grasshopper: 3,
    };
    this.gameArray
      .filter((hexObj) => hexObj.player === player)
      .forEach((hexObj) => {
        if (hexObj.insectName === "queen") piecesDictionary.queen--;
        else if (hexObj.insectName === "spider") piecesDictionary.spider--;
        else if (hexObj.insectName === "beetle") piecesDictionary.beetle--;
        else if (hexObj.insectName === "ant") piecesDictionary.ant--;
        else if (hexObj.insectName === "grasshopper")
          piecesDictionary.grasshopper--;
      });

    const availablePieces = [];
    for (const key in piecesDictionary)
      if (piecesDictionary[key] !== 0) availablePieces.push(key);
    return availablePieces;
  };
  dfs(v, p = -1) {
    this.visited[v] = true;
    this.tin[v] = this.low[v] = this.timer++;
    let children = 0;
    for (let to of this.gameArray[v].adj) {
      if (to === p) continue;
      if (this.visited[to]) {
        this.low[v] = Math.min(this.low[v], this.tin[to]);
      } else {
        this.dfs(to, v);
        this.low[v] = Math.min(this.low[v], this.low[to]);
        if (this.low[to] >= this.tin[v] && p !== -1) {
          this.gameArray[v].canMove = false;
        }
        ++children;
      }
    }
    if (p === -1 && children > 1) {
      this.gameArray[v].canMove = false;
    }
  }

  findCutpoints() {
    this.timer = 0;
    this.visited = new Array(this.gameArray.length).fill(false);
    this.tin = new Array(this.gameArray.length).fill(-1);
    this.low = new Array(this.gameArray.length).fill(-1);
    for (let i = 0; i < this.gameArray.length; ++i) {
      if (!this.visited[i]) {
        this.dfs(i);
      }
    }
  }

  initializeCanMove() {
    this.gameArray.forEach((hexObj) => (hexObj.canMove = true));
  }

  defineAdjacencyList() {
    this.gameArray.forEach((hexObj, index) => {
      hexObj.adj = getNeighbors(this.gameArray, hexObj.hex).map((neighbor) =>
        this.gameArray.indexOf(neighbor)
      );
    });
  }
  isPinned(originalHex) {
    const arrayOfSameCoordinates = this.gameArray.filter((hexObj) =>
      hexObj.hex.isEqual(originalHex)
    );
    //! [1,2,3]
    if (arrayOfSameCoordinates.length > 1)
      for (let i = 0; i < arrayOfSameCoordinates.length; i++)
        if (arrayOfSameCoordinates[i].hex.stack > originalHex.stack)
          return false;
    return true;
  }
  updateCanMove() {
    this.initializeCanMove();
    this.defineAdjacencyList();
    this.findCutpoints();
    this.gameArray.forEach((hexObj) => {
      hexObj.canMove = hexObj.canMove && this.isPinned(hexObj.hex);
    });
  }
}
