/*
opponentQueenSurrounding(gameArray, player) {
    const opponentQueen = gameArray.find(
      (piece) => piece.insectName === "queen" && piece.player !== player
    );
    if (!opponentQueen) return 0;
    const occupiedNeighbors = getNeighbors(gameArray, opponentQueen.hex);
    return occupiedNeighbors.length;
  }
  ownQueenFreedom(gameArray, player) {
    const ownQueen = gameArray.find(
      (piece) => piece.insectName === "queen" && piece.player === player
    );
    if (!ownQueen) return 0;
    const neighbors = ownQueen.hex.generateAllAdjacentMoves();
    const emptyNeighbors = neighbors.filter(
      (hex) => !isOccupied(gameArray, { hex })
    );
    return emptyNeighbors.length;
  }
  materialDifference(gameArray, player) {
    const playerPieces = gameArray.filter(
      (piece) => piece.player === player
    ).length;
    const opponentPieces = gameArray.filter(
      (piece) => piece.player !== player
    ).length;
    return playerPieces - opponentPieces;
  }
  pieceMobility(gameArray, player) {
    const playerPieces = gameArray.filter((piece) => piece.player === player);
    let mobility = 0;
    playerPieces.forEach((piece) => {
      mobility += piece.type.generateAllowedPossibleMoves(gameArray).length;
    });
    return mobility;
  }
  opponentImmobilization(gameArray, player) {
    const opponentPieces = gameArray.filter((piece) => piece.player !== player);
    return opponentPieces.filter(
      (piece) => !piece.type.generateAllowedPossibleMoves(gameArray).length
    ).length;
  }
  beetleAdvantage(gameArray, player) {
    const beetles = gameArray.filter(
      (piece) => piece.player === player && piece.insectName === "beetle"
    );
    return beetles.filter((beetle) => beetle.hex.stack > 0).length;
  }
  threatsToOwnQueen(gameArray, player) {
    const ownQueen = gameArray.find(
      (piece) => piece.insectName === "queen" && piece.player === player
    );
    if (!ownQueen) return 0;
    const neighbors = getNeighbors(gameArray, ownQueen.hex);
    const threats = neighbors.filter((piece) => piece.player !== player);
    return threats.length;
  }
  antMobility(gameArray, player) {
    const ants = gameArray.filter(
      (piece) => piece.player === player && piece.insectName === "ant"
    );
    let mobility = 0;
    ants.forEach((ant) => {
      mobility += ant.type.generateAllowedPossibleMoves(gameArray).length;
    });
    return mobility;
  }
  pieceAdvancement(gameArray, player) {
    const opponentQueen = gameArray.find(
      (piece) => piece.insectName === "queen" && piece.player !== player
    );
    if (!opponentQueen) return 0;
    const playerPieces = gameArray.filter((piece) => piece.player === player);
    return -playerPieces.reduce(
      (sum, piece) => sum + piece.hex.distanceTo(opponentQueen.hex),
      0
    );
  }
  evaluation(gameArray, player) {
    if (this.evaluationCache.has(gameArray)) {
      return this.evaluationCache.get(gameArray);
    }
    const material = this.materialDifference(gameArray, player) * 10;
    const opponentQueenThreat =
      this.opponentQueenSurrounding(gameArray, player) * 100;
    const ownQueenSafety = this.ownQueenFreedom(gameArray, player) * 50;
    const advancement = this.pieceAdvancement(gameArray, player);
    const immobilization = this.opponentImmobilization(gameArray, player) * 30;
    const mobility = this.pieceMobility(gameArray, player) * 5;
    const beetleAdv = this.beetleAdvantage(gameArray, player) * 20;
    const threatsToQueen = this.threatsToOwnQueen(gameArray, player) * -100;
    const antMobilityScore = this.antMobility(gameArray, player) * 2;
    let score =
      material +
      opponentQueenThreat +
      ownQueenSafety +
      advancement +
      immobilization +
      mobility +
      beetleAdv +
      threatsToQueen +
      antMobilityScore;

    this.evaluationCache.set(gameArray, score);
    return score;
  }*/

//todo version that is not tested yet
// abPruning = (
//   depth = 0,
//   gameArray,
//   node,
//   maximizingPlayer,
//   alpha = -Infinity,
//   beta = Infinity
// ) => {
//   const zobristHash = this.computeZobristHash(gameArray);
//   if (this.transpositionTable.has(zobristHash)) {
//     return this.transpositionTable.get(zobristHash);
//   }
//   if (depth === this.depth) {
//     const evaluation =
//       this.evaluation(gameArray, this.player) -
//       this.evaluation(gameArray, this.opponent);
//     return evaluation;
//   }

//   const movements = this.mergeMovementsAndPlacement(
//     maximizingPlayer ? this.player : this.opponent,
//     gameArray,
//     node
//   );

//   // Evaluate and sort moves
//   movements.forEach((child) => {
//     const gameArrayCopy = this.applyMove(gameArray, child);
//     child.heuristic =
//       this.evaluation(gameArrayCopy, this.player) -
//       this.evaluation(gameArrayCopy, this.opponent);
//     this.undoMove(gameArray, child);
//   });

//   movements.sort((a, b) => {
//     return maximizingPlayer
//       ? b.heuristic - a.heuristic
//       : a.heuristic - b.heuristic;
//   });

//   let bestHeuristic = maximizingPlayer ? -Infinity : Infinity;

//   for (let child of movements) {
//     this.applyMove(gameArray, child);

//     const heuristicValue = this.abPruning(
//       depth + 1,
//       gameArray,
//       child,
//       !maximizingPlayer,
//       alpha,
//       beta
//     );

//     this.undoMove(gameArray, child);

//     if (maximizingPlayer) {
//       bestHeuristic = Math.max(bestHeuristic, heuristicValue);
//       alpha = Math.max(alpha, bestHeuristic);
//     } else {
//       bestHeuristic = Math.min(bestHeuristic, heuristicValue);
//       beta = Math.min(beta, bestHeuristic);
//     }

//     if (beta <= alpha) {
//       break; // Prune remaining branches
//     }
//   }
//   this.transpositionTable.set(zobristHash, bestHeuristic);
//   return bestHeuristic;
// };
// applyMove(gameArray, move) {
//   if (move.isPlacement) {
//     // Add new piece
//     const newPiece = {
//       hexHTML: null,
//       hex: move.possibleMoveHex,
//       player: move.player,
//       type: this.constructInsectObject(
//         move.insectName,
//         move.possibleMoveHex,
//         move.player
//       ),
//       insectName: move.insectName,
//     };
//     gameArray.push(newPiece);
//     move.addedPiece = newPiece; // Keep reference for undo
//   } else {
//     // Move existing piece
//     const piece = gameArray.find(
//       (p) => p.hex.isEqual(move.originalPieceHex) && p.player === move.player
//     );
//     move.prevHex = piece.hex;
//     piece.hex = move.possibleMoveHex;
//     piece.type.hex = move.possibleMoveHex;
//   }
// }

// undoMove(gameArray, move) {
//   if (move.isPlacement) {
//     // Remove the added piece
//     const index = gameArray.indexOf(move.addedPiece);
//     if (index > -1) {
//       gameArray.splice(index, 1);
//     }
//   } else {
//     // Revert piece to previous position
//     const piece = gameArray.find(
//       (p) => p.hex.isEqual(move.possibleMoveHex) && p.player === move.player
//     );
//     piece.hex = move.prevHex;
//     piece.type.hex = move.prevHex;
//   }
// }
// computeZobristHash(gameArray) {
//   let hash = 0;
//   for (const piece of gameArray) {
//     const pieceKey = `${piece.insectName}-${piece.player}-${piece.hex.q}-${piece.hex.r}`;
//     const pieceHash =
//       this.zobristTable.get(pieceKey) || this.generateRandomHash();
//     this.zobristTable.set(pieceKey, pieceHash);
//     hash ^= pieceHash;
//   }
//   return hash;
// }

// generateRandomHash() {
//   return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
// }

// evaluationFunctionGeneral = (gameArrayDeepCopy, player, opponent) => {
//   let score = 0;
//   const opponentQueenHexObj = gameArrayDeepCopy.filter(
//     (hexObj) => hexObj.insectName == "queen" && hexObj.player == opponent
//   )[0];
//   //* O(n)
//   const neighbors = opponentQueenHexObj
//     ? getNeighbors(gameArrayDeepCopy, opponentQueenHexObj.hex)
//     : [];
//   //! 1.1) Neighbor pieces except ant
//   const myNeighborsPiecesWithoutAnt = neighbors.filter(
//     (hexObj) => hexObj.player == player && hexObj.insectName !== "ant"
//   ).length;
//   //! 1.2) Neighbor pieces with ant and immobilized opponent neighbor pieces
//   const myAntNeighborPieces = neighbors.filter(
//     (hexObj) => hexObj.player == player && hexObj.insectName === "ant"
//   ).length;
//   //* O(b^d)
//   const immobilizedOpponentNeighborsPieces = gameArrayDeepCopy.filter(
//     (hexObj) =>
//       hexObj.player === opponent && isImmobilized(hexObj.hex, gameArrayDeepCopy)
//   ).length;
//   //! 1.3) My mobile pieces
//   const myMobilePieces = gameArrayDeepCopy.filter(
//     (hexObj) =>
//       hexObj.player === player && !isImmobilized(hexObj.hex, gameArrayDeepCopy)
//   );
//   //! 1.4) My beetles
//   const myBeetles = gameArrayDeepCopy.filter(
//     (hexObj) => hexObj.player === player && hexObj.insectName === "beetle"
//   );
//   //!2) Substitute in the equation
//   score += myNeighborsPiecesWithoutAnt * 5500;
//   score += (myAntNeighborPieces + immobilizedOpponentNeighborsPieces) * 5000;
//   for (const insectName in this.mobilityScores) {
//     const mobilePiecesCount = myMobilePieces.filter(
//       (piece) => piece.insectName === insectName
//     ).length;
//     //!3 spider in game array
//     if (mobilePiecesCount === 0) continue;
//     const mobilityValue =
//       mobilePiecesCount * this.mobilityScores[insectName] * 10;
//     const insectBonus =
//       insectName === "ant" ? 300 * mobilePiecesCount : 200 * mobilePiecesCount;
//     score += mobilityValue + insectBonus;

//     if (opponentQueenHexObj)
//       score += myBeetles.reduce(
//         (acc, beetle) =>
//           100 *
//             (1 /
//               (this.distanceFromQueen(opponentQueenHexObj.hex, beetle.hex) == 0
//                 ? 1 / 3
//                 : this.distanceFromQueen(opponentQueenHexObj.hex, beetle.hex) +
//                   1)) +
//           acc,
//         0
//       );
//     score += neighbors.length >= 6 ? 30000 : 0;
//     //! new score calculation
//     return score;
//   }
// };
import {
  Hex,
  getNeighbors,
  isImmobilized,
  canPhysicallySlide,
  isOccupied,
} from "/js/hex.js";
import { QueenHex } from "/js/queenHex.js";
import { BeetleHex } from "/js/beetleHex.js";
import { GrasshopperHex } from "/js/grasshopperHex.js";
import { AntHex } from "/js/antHex.js";
import { SpiderHex } from "/js/spiderHex.js";
import { generateAllNextAllowedPossibleMovesAI } from "/js/gameHelpers.js";
import { generateAllNextPossibleMoves } from "/js/board.js";

/*
 * h = neighbors * 5500 (non-ant pieces)
 * h = neighbors * 5000 (ant-pieces or immobile minimizer)
 * h_mobility = Summation(200+piece(i)*10)
 * h_ mobility = +100 (in case of mobile soldier ants)
 * h_beetle = +100 * 1/|(1-distance)|
 * h_final = +30000 (if neighbors ==6)
 */

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
