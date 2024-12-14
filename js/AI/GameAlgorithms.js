import {
  Hex,
  getNeighbors,
  canPhysicallySlide,
  isOccupied,
} from "/js/Insects/hex.js";
import { QueenHex } from "/js/Insects/queenHex.js";
import { BeetleHex } from "/js/Insects/beetleHex.js";
import { GrasshopperHex } from "/js/Insects/grasshopperHex.js";
import { AntHex } from "/js/Insects/antHex.js";
import { SpiderHex } from "/js/Insects/spiderHex.js";
import {
  generateAllNextAllowedPossibleMovesAI,
  generateAllowedPlacements,
  TreeNode,
} from "/js/gameHelpers.js";
import { Board } from "/js/AI/Board.js";

const flattenPossibleMoves = (allPossibleMovesFromPlayer) =>
  allPossibleMovesFromPlayer
    .flatMap((possibleMoveObj) => possibleMoveObj.possibleMoves)
    .map((hexDirectionObj) => hexDirectionObj.hex);

export class Node {
  possibleMoveHex;
  originalPieceHex;
  insectName;
  heuristic;
  player;
  parent;
  constructor(
    possibleMoveHex,
    originalPieceHex,
    insectName,
    heuristic,
    player,
    parent
  ) {
    this.possibleMoveHex = possibleMoveHex;
    this.originalPieceHex = originalPieceHex;
    this.insectName = insectName;
    this.heuristic = heuristic;
    this.player = player;
    this.parent = parent;
  }
}
export class GameAlgorithms {
  gameArray;
  depth;
  player;
  opponent;
  evaluationArray;
  memo;
  round;
  repeatedStore;
  gameTree;
  board;
  constructor(gameArray, memo, board, player = 2, depth = 5) {
    this.gameArray = gameArray;
    this.depth = depth;
    this.player = player;
    this.opponent = player === 1 ? 2 : 1;
    this.memo = memo;
    this.repeatedStore = 0;
    this.round = 1;
    this.evaluationArray = [];
    this.board = board;
  }
  getAllowedMovements = (player, gameArray) => {
    const isQueenPlaced = this.isQueenPlaced(player);
    const isOpponentQueenPlaced = this.isQueenPlaced(player === 1 ? 2 : 1);
    let allowedMovements = [];
    if (isQueenPlaced && isOpponentQueenPlaced)
      allowedMovements = gameArray
        .filter((hexObj) => hexObj.player === player)
        .map((AIHexObj) => {
          return {
            originalPiece: AIHexObj,
            possibleMoves:
              AIHexObj.type.generateAllowedPossibleMoves(gameArray),
          };
        });
    return allowedMovements;
  };
  isQueenPlaced = (player) =>
    this.gameArray.some(
      (hexObj) => hexObj.insectName == "queen" && hexObj.player == player
    );
  isPinned = (HexObj) =>
    this.gameArray
      .filter((hexObj) => hexObj.hex.isEqual(HexObj.hex))
      .some((hexObj) => hexObj.hex.stack > HexObj.hex.stack);
  isImmobilized = (HexObj, gameArray) =>
    !HexObj.canMove ||
    !this.isPinned(HexObj) ||
    !canPhysicallySlide(HexObj.hex, gameArray);
  minMax() {
    // Getting AI current movements
    const rootNode = new Node(null, null, null, -Infinity, this.player, null);
    /* const myMovements = this.mergeMovementsAndPlacement(
      this.player,
      this.gameArray,
      rootNode
    ); */
    // console.log("Game array: ", this.gameArray);
    // Recursively find the best movement

    // console.log("Best heuristic: ", rootNode.heuristic);
    const moves = this.evaluateHeuristicRecursively(
      0,
      this.gameArray,
      rootNode,
      true
    );

    // console.log(moves.sort((a, b) => b.heuristic - a.heuristic)[0]);
    /* console.log(
      `Best heuristic: ${Math.max(...moves.map((move) => move.heuristic))}`
    ); */
    return moves;
  }
  alphaBeta() {
    const rootNode = new Node(null, null, null, -Infinity, this.player, null);
    const timeMetrics = {
      deepCopyTime: 0,
      moveGeneratorTime: 0,
      evaluation: 0,
    };
    this.gameTree = [];
    this.board.updateCanMove();
    const moves = this.abPruning(
      0,
      rootNode,
      true,
      -Infinity,
      Infinity,
      timeMetrics
    );
    let bestMoves;
    console.log(moves);
    if (
      this.round === 3 &&
      this.gameArray.filter(
        (hexObj) =>
          hexObj.insectName === "queen" && hexObj.player === this.player
      ).length === 0
    ) {
      bestMoves = moves.filter((hexObj) => hexObj.insectName === "queen")[0];
      return bestMoves;
    } else {
      const maxHeuristic = moves.sort((a, b) => b.heuristic - a.heuristic)[0]
        .heuristic;
      if (maxHeuristic === undefined) return null;
      bestMoves = moves.filter((node) => node.heuristic === maxHeuristic);
    }
    this.round++;
    console.log("Player round", this.round);

    console.log("Memo");
    console.log(this.memo);
    this.board.updateCanMove();
    // console.log(this.gameArray);

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }
  //! Eval = advantage(maximizer) - threat(minimizer)
  abPruning = (
    depth = 0,
    node,
    maximizingPlayer,
    alpha = -Infinity,
    beta = Infinity,
    timeMetrics
  ) => {
    if (depth === this.depth) {
      //! If this state is in the cache, return the heuristic
      const evaluationStart = Date.now();
      const cachedHeuristic = this.memo.getCachedHeuristic();
      let evaluation;
      if (cachedHeuristic) evaluation = cachedHeuristic;
      else {
        evaluation = this.evaluationFunctionGeneral(
          this.gameArray,
          this.player,
          this.opponent
        );
        this.memo.cacheGameStateHeuristic(evaluation);
      }
      timeMetrics.evaluation += Date.now() - evaluationStart;
      this.evaluationArray.push(evaluation);

      return evaluation;
    }

    const moveGeneratorStartTime = Date.now();
    let movements;
    movements = this.board.mergeMovementsAndPlacement(
      this.player,
      maximizingPlayer ? this.player : this.opponent,
      this.gameArray,
      node
    );
    timeMetrics.moveGeneratorTime += Date.now() - moveGeneratorStartTime;

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (let child of movements) {
        this.applyMove(child);
        let heuristicValue;
        const isMaximizerWinning = this.board.isWinningState(this.opponent);
        const isMinimizerWinning = this.board.isWinningState(this.player);
        if (isMaximizerWinning && isMinimizerWinning) heuristicValue = 0;
        else if (isMaximizerWinning) heuristicValue = Infinity;
        else if (isMinimizerWinning) heuristicValue = -Infinity;
        else
          heuristicValue = this.abPruning(
            depth + 1,
            child,
            false,
            alpha,
            beta,
            timeMetrics
          );
        this.undoMove(child);
        maxEval = Math.max(maxEval, heuristicValue);
        alpha = Math.max(alpha, heuristicValue);

        if (depth === this.depth - 1) child.heuristic = heuristicValue;
        if (beta <= alpha) {
          break;
        }
      }
      node.heuristic = maxEval; //! return to maxEval if something breaks
      if (depth === 0) {
        return movements;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let child of movements) {
        this.applyMove(child);

        let heuristicValue;
        const isMaximizerWinning = this.board.isWinningState(this.opponent);
        const isMinimizerWinning = this.board.isWinningState(this.player);
        if (isMaximizerWinning && isMinimizerWinning) heuristicValue = 0;
        else if (isMaximizerWinning) heuristicValue = Infinity;
        else if (isMinimizerWinning) heuristicValue = -Infinity;
        else
          heuristicValue = this.abPruning(
            depth + 1,
            child,
            true,
            alpha,
            beta,
            timeMetrics
          );

        const undoTime = Date.now();

        this.undoMove(child);

        timeMetrics.deepCopyTime += Date.now() - undoTime;

        minEval = Math.min(minEval, heuristicValue);
        beta = Math.min(beta, heuristicValue);

        if (depth === this.depth - 1) child.heuristic = heuristicValue;
        if (beta <= alpha) {
          break;
        }
      }
      node.heuristic = minEval; //! return to minEval if something breaks
      if (depth === 0) {
        return movements;
      }

      return minEval;
    }
  };
  applyMove = (node) => {
    //! 1) existing move on board
    if (node.originalPieceHex) {
      this.simulatePlacingPossibleMoveInGameArray(node, "apply");
      return;
    }
    //! in case of placement possible node
    const nodeToPop = {
      hex: node.possibleMoveHex,
      type: this.constructInsectObject(node.insectName, node.possibleMoveHex),
      player: node.player,
      insectName: node.insectName,
    };
    this.board.pushToBoard(nodeToPop);
    return;
  };
  undoMove = (appliedMoveNode) => {
    if (appliedMoveNode.originalPieceHex) {
      this.simulatePlacingPossibleMoveInGameArray(appliedMoveNode, "undo");
      return;
    }
    this.board.popFromBoard();
  };
  constructGameArrayDeepCopy = (node, gameArray) => {
    //!1) If this node has no start position create new one and add it to the deep copy
    const gameArrayDeepCopy = _.cloneDeep(
      gameArray.map((hexObj) => {
        return {
          hex: hexObj.hex,
          type: hexObj.type,
          player: hexObj.player,
          insectName: hexObj.insectName,
        };
      })
    );
    //! modify the game array for the movement type nodes
    if (node.originalPieceHex) {
      this.simulatePlacingPossibleMoveInGameArray(node, gameArrayDeepCopy);
      return gameArrayDeepCopy;
    }
    //! add new move to the game array for the placement type nodes
    gameArrayDeepCopy.push({
      hex: node.possibleMoveHex,
      type: this.constructInsectObject(node.insectName, node.possibleMoveHex),
      player: node.player,
      insectName: node.insectName,
    });
    return gameArrayDeepCopy;
    //!2) if this node has start then just modify the deep copy
  };
  evaluateHeuristicRecursively = (
    depth = 0,
    gameArray,
    node,
    maximizingPlayer
  ) => {
    if (depth === this.depth) {
      const evaluation =
        this.evaluationFunctionGeneral(gameArray, this.player, this.opponent) -
        this.evaluationFunctionGeneral(gameArray, this.opponent, this.player);
      return evaluation;
    }

    const movements = this.mergeMovementsAndPlacement(
      maximizingPlayer ? this.player : this.opponent,
      gameArray,
      node
    );

    let bestHeuristic = maximizingPlayer ? -Infinity : Infinity;

    for (let child of movements) {
      const gameArrayDeepCopy = this.constructGameArrayDeepCopy(
        child,
        gameArray
      );

      const heuristicValue = this.evaluateHeuristicRecursively(
        depth + 1,
        gameArrayDeepCopy,
        child,
        !maximizingPlayer
      );

      child.heuristic = heuristicValue;

      if (maximizingPlayer) {
        if (heuristicValue > bestHeuristic) {
          bestHeuristic = heuristicValue;
        }
      } else {
        if (heuristicValue < bestHeuristic) {
          bestHeuristic = heuristicValue;
        }
      }
    }

    node.heuristic = bestHeuristic;

    if (depth === 0) {
      return movements;
    }
    return bestHeuristic;
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
  //! 1,2 -> 3,-1
  simulatePlacingPossibleMoveInGameArray = (node, mode) => {
    let possibleMoveHex;
    let originalHex;
    if (mode === "apply") {
      possibleMoveHex = node.possibleMoveHex;
      originalHex = node.originalPieceHex;
    } else {
      possibleMoveHex = node.originalPieceHex;
      originalHex = node.possibleMoveHex;
    }
    this.board.mutateBoard(originalHex, possibleMoveHex, node);
  };
  evaluationFunctionGeneral = (gameArrayDeepCopy, player, opponent) => {
    /*
     * h += 30000 immobilizedQueen (not working)
     * h += 5000 (immobilized opponent pieces + my ants )
     */
    const mobilityScoresEarly = {
      queen: 1000,
      spider: 6,
      grasshopper: 4,
      beetle: 4,
      ant: 2,
    };
    const mobilityScoresMidEnd = {
      queen: 1000,
      ant: 6,
      grasshopper: 4,
      beetle: 4,
      spider: 2,
    };
    let threat = 0;
    let advantage = 0;

    const myPieces = [];
    const opponentPieces = [];
    let opponentQueenHexObj = null;
    let myQueenHexObj = null;
    const myBeetles = [];
    const opponentBeetles = [];
    const myAnts = [];
    const opponentAnts = [];
    //! O(n) till this point
    for (let i = 0; i < gameArrayDeepCopy.length; i++) {
      if (
        gameArrayDeepCopy[i].insectName === "queen" &&
        gameArrayDeepCopy[i].player === opponent
      ) {
        opponentQueenHexObj = gameArrayDeepCopy[i];
      } else if (
        gameArrayDeepCopy[i].insectName === "queen" &&
        gameArrayDeepCopy[i].player === player
      ) {
        myQueenHexObj = gameArrayDeepCopy[i];
      }

      if (gameArrayDeepCopy[i].player == player)
        myPieces.push(gameArrayDeepCopy[i]);
      else if (gameArrayDeepCopy[i].player == opponent)
        opponentPieces.push(gameArrayDeepCopy[i]);

      if (
        gameArrayDeepCopy[i].player === player &&
        gameArrayDeepCopy[i].insectName === "beetle"
      )
        myBeetles.push(gameArrayDeepCopy[i]);
      else if (
        gameArrayDeepCopy[i].player == opponent &&
        gameArrayDeepCopy[i].insectName === "beetle"
      )
        opponentBeetles.push(gameArrayDeepCopy[i]);
      if (
        gameArrayDeepCopy[i].player == player &&
        gameArrayDeepCopy[i].insectName === "ant"
      )
        myAnts.push(gameArrayDeepCopy[i]);
      else if (
        gameArrayDeepCopy[i].player == opponent &&
        gameArrayDeepCopy[i].insectName === "ant"
      )
        opponentAnts.push(gameArrayDeepCopy[i]);
    }

    if (this.round > 3) {
      //! bonus for neighbors of the opponent queen for my and his neighbors
      const myQueenNeighbors = getNeighbors(
        gameArrayDeepCopy,
        myQueenHexObj.hex
      ).filter((neighbor) => neighbor.hex.stack === 0);

      const opponentQueenNeighbors = getNeighbors(
        gameArrayDeepCopy,
        opponentQueenHexObj.hex
      ).filter((neighbor) => neighbor.hex.stack === 0);
      if (opponentQueenNeighbors.length === 6) return Infinity;
      else if (myQueenNeighbors.length === 6) return -Infinity;
      else if (
        (myQueenNeighbors.length === opponentQueenNeighbors.length) ===
        6
      )
        return 0;
      opponentQueenNeighbors.forEach((neighbor) => {
        advantage += 200;
        if (neighbor.player === player && neighbor.insectName !== "ant") {
          advantage += 5500;
        } else advantage += 5000;
        if (
          neighbor.player === opponent &&
          this.isImmobilized(neighbor, gameArrayDeepCopy)
        )
          advantage += 3000;
      });
      myQueenNeighbors.forEach((neighbor) => {
        threat += 200;
        if (
          /* opponentPieces.some((opponentPiece) =>
            opponentPiece.hex.isEqual(neighbor.hex)
          ) */
          neighbor.player === opponent &&
          neighbor.insectName !== "ant"
        )
          threat += 5500;
        else threat += 5000;
        if (
          neighbor.player === player &&
          this.isImmobilized(neighbor, gameArrayDeepCopy)
        )
          threat += 3000;
      });

      //! my beetle mobility
      myBeetles.forEach((beetle) => {
        if (
          beetle.hex.stack > 0 &&
          this.distanceFromQueen(beetle.hex, opponentQueenHexObj.hex) === 0
        )
          advantage += 100;
        else if (beetle.hex.stack > 0) {
          advantage +=
            (100 * 10) /
            this.distanceFromQueen(beetle.hex, opponentQueenHexObj.hex);
        }
        if (
          beetle.hex.stack === 0 &&
          !this.isImmobilized(beetle, gameArrayDeepCopy)
        )
          advantage +=
            (100 * 10) /
            this.distanceFromQueen(beetle.hex, opponentQueenHexObj.hex);
      });
      //! opponent beetle mobility
      opponentBeetles.forEach((beetle) => {
        if (
          beetle.hex.stack > 0 &&
          this.distanceFromQueen(beetle.hex, myQueenHexObj.hex) == 0
        )
          threat += 100;
        else if (beetle.hex.stack > 0) {
          threat +=
            (100 * 10) / this.distanceFromQueen(beetle.hex, myQueenHexObj.hex);
        }
        if (
          beetle.hex.stack === 0 &&
          !this.isImmobilized(beetle, gameArrayDeepCopy)
        )
          threat +=
            (100 * 10) / this.distanceFromQueen(beetle.hex, myQueenHexObj.hex);
      });
    }

    if (
      opponentQueenHexObj &&
      this.isImmobilized(opponentQueenHexObj, gameArrayDeepCopy)
    ) {
      advantage += 30000;
    }
    if (myQueenHexObj && this.isImmobilized(myQueenHexObj, gameArrayDeepCopy)) {
      threat += 30000;
    }

    //! my ant mobility
    myAnts.forEach((ant) => {
      if (myQueenHexObj && !this.isImmobilized(ant, gameArrayDeepCopy))
        advantage += 200;
    });
    //! opponent ant mobility
    //! Sussy baka
    opponentAnts.forEach((ant) => {
      if (opponentQueenHexObj && !this.isImmobilized(ant, gameArrayDeepCopy))
        threat += 200;
    });

    if (this.round < 3)
      for (const insect in mobilityScoresEarly) {
        //! number of insects like 3 spider
        let insectCount = myPieces.reduce(
          (acc, piece) => (acc + piece.insectName === insect ? 1 : 0),
          0
        );
        advantage += insectCount * 100 * mobilityScoresEarly[insect];
      }
    else
      for (const insect in mobilityScoresMidEnd) {
        //! number of insects like 3 spider
        let insectCount = myPieces.reduce(
          (acc, piece) => (acc + piece.insectName === insect ? 1 : 0),
          0
        );
        advantage += insectCount * 100 * mobilityScoresMidEnd[insect];
      }

    myPieces.forEach((piece) => {
      if (myQueenHexObj && !this.isImmobilized(piece, gameArrayDeepCopy))
        advantage += 200;
    });

    opponentPieces.forEach((piece) => {
      if (opponentQueenHexObj && !this.isImmobilized(piece, gameArrayDeepCopy))
        threat += 200;
    });

    return advantage - threat;
  };
  evaluationFunctionUltimate = (gameArrayDeepCopy, player, opponent) => {
    const mobilityScoresEarly = {
      queen: 1000,
      spider: 6,
      grasshopper: 4,
      beetle: 4,
      ant: 2,
    };
    const mobilityScoresMidEnd = {
      queen: 1000,
      ant: 6,
      grasshopper: 4,
      beetle: 4,
      spider: 2,
    };
  };
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

  distanceFromQueen = (pieceHex, queenHex) =>
    (Math.abs(pieceHex.q - queenHex.q) +
      Math.abs(pieceHex.q + pieceHex.r - queenHex.q - queenHex.r) +
      Math.abs(pieceHex.r - queenHex.r)) /
    2;
}
//! Construct a hashmap, given a game state -> store the movements, and the evaluation scores for a given state
export class GameStateCache {
  gameArray;
  heuristicHashMap;
  movementHashMap;
  gameArrayMaxSize;
  constructor(gameArray) {
    this.gameArray = gameArray;
    this.heuristicHashMap = new Map();
    this.movementHashMap = new Map();
    this.gameArrayMaxSize = gameArray.length;
  }
  clearCache() {
    if (this.gameArray.length === this.gameArrayMaxSize) return;
    this.movementHashMap.clear();
    this.heuristicHashMap.clear();
    this.gameArrayMaxSize = this.gameArray.length;
  }
  constructHashKey() {
    return this.gameArray
      .flatMap(
        (hexObj) =>
          `${hexObj.hex.coordinates}-${hexObj.hex.stack}-${hexObj.insectName}-${hexObj.player}`
      )
      .join("-");
  }
  cacheGameStateHeuristic(heuristic) {
    this.heuristicHashMap.set(this.constructHashKey(), heuristic);
  }
  cacheMovementsFromCurrentGameState(movements) {
    this.movementHashMap.set(this.constructHashKey(), movements);
  }
  getCachedMovements = () => this.movementHashMap.get(this.constructHashKey());
  getCachedHeuristic = () => this.heuristicHashMap.get(this.constructHashKey());
}

class ZobristHashing {
  gameArray;
  ZobristTable = {};
  constructor(gameArray) {
    this.gameArray = gameArray;
  }
  initializeZobristTable(gameArray) {
    const pieceTypes = ["queen", "ant", "beetle", "grasshopper", "spider"];
    const players = [1, 2];
    gameArray.forEach((hexObj) => {
      const position = hex.hex.coordinates;
      pieceTypes.forEach((pieceType) => {
        players.forEach((player) => {
          const key = `${piece}-${hexObj.stack}-${player}`;
          this.ZobristTable[position][key] = BigInt(
            Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
          );
        });
      });
    });
    return this.ZobristTable;
  }
  //! Function 1->1
  getZobristHashKey(gameArray) {
    let hashKey = 0;
    gameArray.forEach((hexObj) => {
      const position = hexObj.hex.coordinates;
      const piece = hexObj.insectName;
      const key = `${piece}-${player}`;
      if (this.zobristTable[position] && this.zobristTable[position][key]) {
        hashKey ^= this.zobristTable[position][key];
      }
    });
    return hashKey;
  }
}
/*
 * gameArray -> {moves, heuristic}
 * (1,0)-stack(1)-insectType(beetle)-player(1)-playerToPlay(1)
 * [{insectType: beetle,player 1,(1,0),stack:1},]
 */
