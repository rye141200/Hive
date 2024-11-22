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
} from "/js/hex.js";

const generateNextHex = (direction, hex) => {
  if (direction == "ne") return new Hex(hex.q + 1, hex.r - 1);
  else if (direction == "n") return new Hex(hex.q, hex.r - 1);
  else if (direction == "se") return new Hex(hex.q + 1, hex.r);
  else if (direction == "s") return new Hex(hex.q, hex.r + 1);
  else if (direction == "nw") return new Hex(hex.q - 1, hex.r);
  else if (direction == "sw") return new Hex(hex.q - 1, hex.r + 1);
  else return null;
};
const generateAllPossibleAllowedNextHex = (
  gameArray,
  hex,
  startHex,
  currentNeighbors
) => {
  const directions = ["n", "s", "ne", "nw", "se", "sw"];

  const allPossibleMoves = directions
    .map((direction) => {
      return { hex: generateNextHex(direction, hex), direction };
    })
    .filter((possibleMove) => {
      const possibleNeighbors = getNeighbors(gameArray, possibleMove.hex);

      return (
        isAdjacent(gameArray, possibleMove) &&
        !isOccupied(gameArray, possibleMove) &&
        !startHex.isEqual(possibleMove.hex) &&
        canSlide(possibleMove.hex, hex, gameArray) &&
        isInContact(possibleNeighbors, currentNeighbors)
      );
    });
  return allPossibleMoves;
};

export class SpiderHex extends Hex {
  player;
  constructor(q, r, player) {
    super(q, r);
    this.player = player;
  }
  generateAllowedPossibleMoves(gameArray) {
    if (!canMoveBreadthFirstSearch(gameArray, this)) return null;

    //const allowedMoves = this.generateSpiderAllowedMoves(gameArray);
    const spiderTree = new SpiderTree(this, gameArray);
    spiderTree.generateTree(spiderTree.root);
    printTree(spiderTree.root);
    console.log("-------------------------------");
    //    spiderTree.constructTree();
    // spiderTree.printTree();

    //return allowedMoves;
  }
}

//! kinda ah tree
class TreeNode {
  hex;
  children;
  parent;
  constructor(hex) {
    this.hex = hex;
    this.children = [];
  }

  addChild(hex) {
    //!1) Generate the possible moves from the root node (returns an array of {hex,direction})
    const newNode = new TreeNode(hex);
    this.children.push(newNode);
    this.children.forEach((child) => (child.parent = this));
    return newNode;
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
class SpiderTree {
  root;
  gameArray;
  constructor(startHex, gameArray) {
    this.root = new TreeNode(startHex);
    this.gameArray = gameArray;
  }

  generateTree(startNode, depth = 0) {
    if (depth === 3) return;
    const children = generateAllPossibleAllowedNextHex(
      this.gameArray,
      startNode.hex,
      startNode.hex,
      getNeighbors(this.gameArray, startNode.hex)
    );

    children.forEach((child) => startNode.addChild(child.hex)); // add all children except parent
    if (depth !== 0)
      startNode.children = startNode.children.filter(
        (child) => !startNode.parent.hex.isEqual(child.hex)
      );
    startNode.children.forEach((childNode) =>
      this.generateTree(childNode, depth + 1)
    );
  }
}

// const root = new TreeNode("root");
// const child1 = root.addChild("child1");
// child1.addChild("child1.1");
// child1.addChild("child1.2");

// const child2 = root.addChild("child2");
// child2.addChild("child2.1");

// printTree(root);
