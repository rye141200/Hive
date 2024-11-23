/*
 * Round 1 -> Player one (maximizer) (Queen,(0,0))
 * Round 2 -> Player two (minimizer) (Queen,(1,0))
 * Round 3 -> Player one (Spider,(0,-1))
 * Round 4 -> Player two (Spider,(2,0))
 * Round 5 -> Player one moved spider to (1,-1)
 * [queen,queen,spider,spider]
 *
 */

import { Hex } from "/js/hex.js";
import { QueenHex } from "/js/queenHex.js";
import { BeetleHex } from "/js/beetleHex.js";
import { GrasshopperHex } from "/js/grasshopperHex.js";
import { AntHex } from "/js/antHex.js";
import { SpiderHex } from "/js/spiderHex.js";

export class GameAlgorithms {
  gameArray;
  player;
  queenSurroundedScore = 100;

  constructor(gameArray, player) {
    this.gameArray = gameArray;
    this.player = player;
  }
}

//! each node contain
//! 1. state represent array of {type:queen,ant,etc , owner: player 1 or player 2 , position: (0,0)..etc}
//! 2. next possible moves for each type == children
//! 3. last move played maybe we need
//! 4. the score of the current move

class TreeNode {
  Hex;
  parent = null;
  children;

  constructor(hex) {
    this.Hex = hex;
    this.children = [];
  }
  addChild(hex) {
    child = new TreeNode(hex);
    child.parent = this;
    this.children.push(child);
  }
}

class GameTree {
  root;
  gameStartState;
  difficulty;
  availablePieces = {
    white: {
      Ant: 3,
      Beetle: 2,
      Grasshopper: 3,
      Queen: 1,
      Spider: 2,
    },
    black: {
      Ant: 3,
      Beetle: 2,
      Grasshopper: 3,
      Queen: 1,
      Spider: 2,
    },
  };
  constructor(rootNode, gameStartState, difficulty = 3) {
    this.root = rootNode;
    this.gameStartState = gameStartState;
    this.difficulty = difficulty;
  }

  generateGameTree(startNode, depth = 0, currentPlayer = 1) {
    if (depth >= this.difficulty) return;

    let children = this.gameStartState.type.generateAllowedPossibleMoves(
      this.gameStartState
    );
    children.forEach((child) => {
      startNode.addChild(new TreeNode(child.hex));
      this.generateGameTree(child, depth + 1, currentPlayer == 1 ? 2 : 1);
    });
  }
}

function printTree(node, depth = 0) {
  console.log(
    " ".repeat(depth * 2) +
      node.hex.coordinates +
      ` ===> parent ${node.parent?.hex}`
  );
  node.children.forEach((child) => printTree(child, depth + 1));
}
