import { hexDrawer } from "/js/UI/hexDrawer.js";
import { Hex, isOccupied, getNeighbors } from "/js/Insects/hex.js";
import { QueenHex } from "/js/Insects/queenHex.js";
import { BeetleHex } from "/js/Insects/beetleHex.js";
import { GrasshopperHex } from "/js/Insects/grasshopperHex.js";
import { AntHex } from "/js/Insects/antHex.js";
import { SpiderHex } from "/js/Insects/spiderHex.js";
import { GameAlgorithms, GameStateCache } from "/js/AI/GameAlgorithms.js";
import { generateAllowedPlacements } from "/js/gameHelpers.js";
import { Board } from "/js/AI/Board.js";
//import { GameTree } from "/js/GameAlgorithms.js";

//! Selectors and global variables
const map = document.querySelector(".map");
const playerOneSection = document.querySelector(".player-1");
const playerTwoSection = document.querySelector(".player-2");
const playerOneLabel = document.querySelector("#player-one");
const playerTwoLabel = document.querySelector("#player-two");
let currentRound = 0;
const gameArray = [];
const playerOneDrawer = new hexDrawer(40, map, 1.5, "hexagon", "possible-hex");
const playerTwoDrawer = new hexDrawer(
  40,
  map,
  1.5,
  "hexagon-2",
  "possible-hex"
);
const beginMovement = {
  playerOne: false,
  playerTwo: false,
};
let player = 1;
let currentCard = null;
let enterThisSectionAgainPlayerOne = true;
let enterThisSectionAgainPlayerTwo = true;
const board = new Board(gameArray);
//! Helpers
export const generateAllNextPossibleMoves = (hex) => {
  const directions = ["n", "ne", "nw", "s", "se", "sw"];
  return directions.map((direction) => {
    return { hex: hex.generateNextHex(direction), direction };
  });
};
export const generateAllNextAllowedPossibleMoves = (gameArray, player) => {
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
  //!5) Construct the startCoordinates object
  allPossibleMovesFromPlayer.forEach(
    (possibleMoveObj) =>
      (possibleMoveObj.startCoordinates = constructStartCoordinates(
        possibleMoveObj.startHexObj.hexHTML,
        possibleMoveObj.startHexObj.hex
      ))
  );
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
const constructInsectObject = (insectToPlace, possiblePlacementHex) => {
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
export const constructHexObject = (hexHTML, hex, player) => {
  const insectType = hexHTML.style.background
    .match(/\/([a-z_]+)\.png/i)?.[1]
    .split("_")
    .pop();
  let type;
  let insectName;
  if (insectType === "queen") {
    type = new QueenHex(hex.q, hex.r, player);
    insectName = "queen";
  } else if (insectType === "spider") {
    insectName = "spider";
    type = new SpiderHex(hex.q, hex.r, player);
  } else if (insectType === "beetle") {
    type = new BeetleHex(hex.q, hex.r, player);
    insectName = "beetle";
  } else if (insectType === "ant") {
    type = new AntHex(hex.q, hex.r, player);
    insectName = "ant";
  } else if (insectType === "grasshopper") {
    type = new GrasshopperHex(hex.q, hex.r, player);
    insectName = "grasshopper";
  }
  return {
    hexHTML,
    hex,
    player,
    type,
    insectName,
  };
};
export const constructStartCoordinates = (hexHTML, hex) => {
  return {
    top: hexHTML.style.top.includes("calc")
      ? hexHTML.style.top
          .replace("calc(", "")
          .substring(0, hexHTML.style.top.replace("calc(", "").length - 1)
      : hexHTML.style.top,
    left: hexHTML.style.left.includes("calc")
      ? hexHTML.style.left
          .replace("calc(", "")
          .substring(0, hexHTML.style.left.replace("calc(", "").length - 1)
      : hexHTML.style.left,
    q: hex.q,
    r: hex.r,
  };
};
const resetCards = (cardsArray) => {
  cardsArray.forEach((card) => {
    if (card.classList.contains("dimmed-hex"))
      card.classList.remove("dimmed-hex");
    if (card.classList.contains("selected-hex"))
      card.classList.remove("selected-hex");
  });
};
const selectCard = (cardsArray, clickedCard) => {
  resetCards(cardsArray);
  cardsArray.forEach((card) => {
    if (card != clickedCard) card.classList.add("dimmed-hex");
  });
  clickedCard.classList.add("selected-hex");
};
const handlePlayerSection = (section, e) => {
  const cardsArray = [
    ...[...section.children[1].children].map((div) => div.children[0]),
  ];
  const clickedCard = e.target;
  if (!cardsArray.includes(clickedCard)) return resetCards(cardsArray);
  selectCard(cardsArray, clickedCard);
  currentCard = clickedCard;
};
function handleP1(event) {
  handlePlayerSection(playerOneSection, event);
}
function handleP2(event) {
  handlePlayerSection(playerTwoSection, event);
}
const disablePlayerPanels = () => {
  playerOneSection.removeEventListener("click", handleP1);
  playerTwoSection.removeEventListener("click", handleP2);
};
export const togglePlayers = () => {
  if (player === 1) {
    playerOneSection.addEventListener("click", handleP1);
    playerTwoSection.removeEventListener("click", handleP2);
    resetCards([
      ...[...playerTwoSection.children[1].children].map(
        (div) => div.children[0]
      ),
    ]);
    playerOneLabel.classList.add("active-player");
    playerTwoLabel.classList.remove("active-player");
    playerOneSection.classList.add("active-section");
    playerTwoSection.classList.remove("active-section");
    if (beginMovement.playerOne) {
      resetHovering();
      enableHovering("black");
    }
  } else {
    playerTwoSection.addEventListener("click", handleP2);
    playerOneSection.removeEventListener("click", handleP1);
    resetCards([
      ...[...playerOneSection.children[1].children].map(
        (div) => div.children[0]
      ),
    ]);
    playerTwoLabel.classList.add("active-player");
    playerOneLabel.classList.remove("active-player");
    playerTwoSection.classList.add("active-section");
    playerOneSection.classList.remove("active-section");
    if (beginMovement.playerTwo) {
      resetHovering();
      enableHovering("white");
    }
  }
  currentCard = null;
};
const setInsectAssets = (insectHTML, id) => {
  insectHTML.style.background = `url(./assets/${id.split("-").join("_")}.png)`;
  insectHTML.classList.add("hex-background");
};
const decrementInsectCount = (id) => {
  const el = document.querySelector(`#${id}`);
  const span = el.nextElementSibling;
  const temp = span.textContent.split("x")[1];
  let counter = +span.textContent.split("x")[0];
  if (counter === 0) {
    return;
  }
  counter--;
  if (counter === 0) {
    el.classList.add("perm-dimmed-hex");
    el.style.pointerEvents = "none";
  }
  span.textContent = `${counter}x${temp}`;
};
const resetHovering = () => {
  [...map.children].forEach((playedPieceHTML) =>
    playedPieceHTML.classList.remove("can-hover")
  );
};

const enableHovering = (blackOrWhite) => {
  [...map.children]
    .filter((playedPieceHTML) => {
      if (blackOrWhite === "black")
        return (
          playedPieceHTML.style.background
            .match(/\/([a-z_]+)\.png/i)?.[1]
            .split("_")[0] === "black"
        );
      else if (blackOrWhite === "white")
        return (
          playedPieceHTML.style.background
            .match(/\/([a-z_]+)\.png/i)?.[1]
            .split("_")[0] === "white"
        );
    })
    .forEach((playedPieceHTML) => playedPieceHTML.classList.add("can-hover"));
};
const turnPossibleMoveIntoInsect = (targetHTML, highlightedInsectHTML) => {
  targetHTML.style.background = highlightedInsectHTML.style.background;
  targetHTML.classList.add("hexagon");
  targetHTML.classList.add("hex-background");
  targetHTML.classList.remove("possible-hex");
};
const removeAllPossibleHexFromBoard = () => {
  [...map.children]
    .filter((childHTML) => childHTML.classList.contains("possible-hex"))
    .forEach((childHTML) => childHTML.remove());
};
//! Rounds
const isQueenPlayed = (canPlayerMove, player) =>
  !canPlayerMove &&
  gameArray.some(
    (hexObj) =>
      hexObj.hexHTML.style.background
        .match(/\/([a-z_]+)\.png/i)?.[1]
        .split("_")
        .pop() === "queen" && hexObj.type.player === player
  );
const enforceToPlayQueen = (playerSection, type) => {
  const cardsArray = [
    ...[...playerSection.children[1].children].map((div) => div.children[0]),
  ];
  currentCard = document.querySelector(`#${type}-queen`);
  cardsArray
    .filter((card) => card.id != currentCard.id)
    .forEach((card) => card.classList.add("dimmed-hex"));
  selectCard(cardsArray, currentCard);
  disablePlayerPanels();
  return true;
};

const roundFourRules = (gameArray) => {
  if (isQueenPlayed(beginMovement.playerOne, 1)) beginMovement.playerOne = true;
  if (isQueenPlayed(beginMovement.playerTwo, 2)) beginMovement.playerTwo = true;

  const numberOfPlayedBlacks = gameArray.filter(
    (hexObj) => hexObj.player == 1
  ).length;
  const numberOfPlayedWhites = gameArray.filter(
    (hexObj) => hexObj.player == 2
  ).length;

  if (
    currentRound == 0 &&
    numberOfPlayedBlacks == 3 &&
    !beginMovement.playerOne
  ) {
    beginMovement.playerOne = enforceToPlayQueen(playerOneSection, "black");
    return true;
  }
  if (
    currentRound == 1 &&
    numberOfPlayedWhites == 3 &&
    !beginMovement.playerTwo
  ) {
    beginMovement.playerTwo = enforceToPlayQueen(playerTwoSection, "white");
    return true;
  }
  return false;
};

const handleRoundOne = (gameDrawer, gameArray) => {
  //!1) Draw the starting hexagon
  const insectHTML = gameDrawer.drawInitialHex();

  setInsectAssets(insectHTML, currentCard.id);
  insectHTML.dataset.stack = 0;
  decrementInsectCount(currentCard.id);

  //!2) Construct the hexObj, add it to the gameArray, hexObj contains hexHTML,hex,player
  const hexObj = constructHexObject(insectHTML, new Hex(0, 0), 1);
  gameArray.push(hexObj);

  //!3) Construct the start coordinates (the point where we will draw from)
  const startCoordinates = constructStartCoordinates(insectHTML, hexObj.hex);

  //!4) Draw all possible next moves

  gameDrawer.drawHighlightedPossibleMoves([
    {
      possibleMoves: generateAllNextPossibleMoves(gameArray[0].hex),
      startHexObj: hexObj,
      startCoordinates: startCoordinates,
    },
  ]);

  currentRound = (currentRound + 1) % 2;
  roundFourRules(gameArray);
  player = 2;
  togglePlayers();
};

const handlePlacement = (e, gameDrawer, gameArray) => {
  const possibleHex = e.target;
  //!0) Guard clause
  if (!possibleHex.classList.contains("possible-hex")) return;

  //!1) Converting the possible move into an actual move
  possibleHex.classList.add(gameDrawer.hexType);
  setInsectAssets(possibleHex, currentCard.id);
  decrementInsectCount(currentCard.id);
  possibleHex.classList.remove("possible-hex");

  //!2) Extracting the start coordinates (coordinates we will start drawing from)
  const coordinatesArray = possibleHex.dataset.coordinates
    .split(",")
    .map((coordinate) => coordinate.replace(/[()]/g, ""));

  //gameArray[gameArray.length - 1].player == 1 ? 2 : 1
  const hexObj = constructHexObject(
    possibleHex,
    new Hex(
      Number.parseInt(coordinatesArray[0]),
      Number.parseInt(coordinatesArray[1])
    ),
    currentRound == 1 ? 2 : 1
  );

  //!3) Drawing the possible highlighted moves

  gameArray.push(hexObj);
  currentRound = (currentRound + 1) % 2;
  player = currentRound == 1 ? 2 : 1;
  const noToggle = roundFourRules(gameArray);
  if (!noToggle) togglePlayers();

  gameDrawer.drawHighlightedPossibleMoves(
    generateAllNextAllowedPossibleMoves(gameArray, player)
  );
};
const handleMovement = (e, gameDrawer) => {
  //!0) Guard clause
  if (e.target.classList.contains("can-hover")) {
    //!1) Highlight the selected piece
    const insectHTML = e.target;
    if (!insectHTML.style.background) return;
    [...map.children].forEach((childHTML) =>
      childHTML.classList.remove("selected-hex-from-board")
    );
    insectHTML.classList.add("selected-hex-from-board");
    currentCard = insectHTML;
    //!2) Identify the piece, construct hexObj
    const coordinatesArray = insectHTML.dataset.coordinates
      .split(",")
      .map((coordinate) => coordinate.replace(/[()]/g, ""));

    const hexObj = gameArray.filter(
      (hexObj) => hexObj.hexHTML === insectHTML
    )[0];
    /* constructHexObject(
      insectHTML,
      new Hex(
        Number.parseInt(coordinatesArray[0]),
        Number.parseInt(coordinatesArray[1])
      ),
      currentRound == 1 ? 2 : 1
    ); */

    //!3) Generate the moves according to the type of the hexObj
    const moves = hexObj.type.generateAllowedPossibleMoves(gameArray);
    /* console.log(moves); */
    //!4) Draw the possible moves
    gameDrawer.drawHighlightedMovementsForAnInsect(moves);
  }
  //!5) Place the piece
  if (
    e.target.classList.contains("possible-hex") &&
    [...map.children].some((playedCard) =>
      playedCard.classList.contains("selected-hex-from-board")
    )
  ) {
    //
    //?5.1) Get the highlighted insect
    const highlightedInsectHTML = [...map.children].filter((playedCard) =>
      playedCard.classList.contains("selected-hex-from-board")
    )[0];
    //?5.2) Set the possible move with the background url
    turnPossibleMoveIntoInsect(e.target, highlightedInsectHTML);
    const coordinatesArray = e.target.dataset.coordinates
      .split(",")
      .map((coordinate) => coordinate.replace(/[()]/g, ""));

    //?5.3) Update the game array

    //?5.3.1) check if the type is beetle to handle the stacking
    const occupiedHex = new Hex(
      Number.parseInt(coordinatesArray[0]),
      Number.parseInt(coordinatesArray[1])
    );
    console.log(occupiedHex);
    //?5.3.2)  All hexes in the same position (coordinates)
    let highestStacked = 0;
    const isBeetleStackingOnAPiece = isOccupied(gameArray, {
      hex: occupiedHex,
      direction: "n",
    });
    if (isBeetleStackingOnAPiece) {
      const sameCoordinatesArray = gameArray.filter((hexObj) =>
        hexObj.hex.isEqual(occupiedHex)
      );
      console.log(sameCoordinatesArray);
      for (let i = 0; i < sameCoordinatesArray.length; i++) {
        if (highestStacked < sameCoordinatesArray[i].hex.stack)
          highestStacked = sameCoordinatesArray[i].hex.stack;
      }
    }

    const index = gameArray.findIndex(
      (hexObj) => hexObj.hexHTML === highlightedInsectHTML
    );
    gameArray[index].hex = new Hex(
      Number.parseInt(coordinatesArray[0]),
      Number.parseInt(coordinatesArray[1])
    );
    gameArray[index].hex.stack = isBeetleStackingOnAPiece
      ? highestStacked + 1
      : 0;
    gameArray[index].type = constructInsectObject(
      gameArray[index].insectName,
      gameArray[index].hex
    );
    gameArray[index].type.stack = isBeetleStackingOnAPiece
      ? highestStacked + 1
      : 0;
    gameArray[index].hexHTML = e.target;
    gameArray[index].hexHTML.dataset.stack = gameArray[index].hex.stack;

    //?5.4) Delete the selected insectHTML from the DOM tree
    highlightedInsectHTML.remove();

    //?5.5) Increment the Round
    currentRound = (currentRound + 1) % 2;
    player = currentRound == 1 ? 2 : 1;
    togglePlayers();
    gameDrawer.eraseAllPossibleHex();
    //?5.6) Draw possible moves for opponent
    gameDrawer.drawHighlightedPossibleMoves(
      generateAllNextAllowedPossibleMoves(gameArray, player)
    );
  }
  //! If there was a selected-hex-from-board and the target was NOT a possible-hex, reset the selected-hex-from-board effect and put the
  else if (
    !e.target.classList.contains("possible-hex") &&
    [...map.children].some((playedCard) =>
      playedCard.classList.contains("selected-hex-from-board")
    ) &&
    !e.target.classList.contains("selected-hex-from-board")
  ) {
    console.log("this is from invalid click");
    document
      .querySelector(".selected-hex-from-board")
      .classList.remove("selected-hex-from-board");
    gameDrawer.eraseAllPossibleHex();
    gameDrawer.drawHighlightedPossibleMoves(
      generateAllNextAllowedPossibleMoves(gameArray, player)
    );
  }
};
const playerVsPlayer = () => {
  if (e.target.style.background) currentCard = e.target;
  if (!currentCard) return alert("FUCK YOU CHOOSE AN INSECT FOR FUCK SAKE");
  // [...map.children].forEach((childHTML) =>
  //   childHTML.classList.remove("selected-hex-from-board")
  // );
  // console.log("before click player is ", player);
  let gameDrawer = currentRound == 1 ? playerOneDrawer : playerTwoDrawer;

  if (gameArray.length == 0) {
    handleRoundOne(gameDrawer, gameArray);
    /* console.time("Alpha Beta");
    AI.alphaBeta();
    console.timeEnd("Alpha Beta"); */
    return;
  }

  if (beginMovement.playerOne && currentRound == 0) {
    //!handle movement for player one or handle placement

    handleMovement(e, gameDrawer);
  }
  if (beginMovement.playerTwo && currentRound == 1) {
    //!handle movement for player two or handle placement
    handleMovement(e, gameDrawer);
  }
  handlePlacement(e, gameDrawer, gameArray);

  if (currentRound === 1) {
    // console.log(memo.constructHashKey(2));
    /* console.time("Alpha Beta");
    AI.alphaBeta();
    console.timeEnd("Alpha Beta"); */
    // generateAllowedPlacements(gameArray, 2);
  }
};
//! Listeners
togglePlayers();

const memoKhedr = new GameStateCache(gameArray);
//const memoOthman = new GameStateCache(gameArray);
//const khedrKarawita = new GameAlgorithms(gameArray, memoKhedr, board, 1, 4);
//const othmanAbdelJaleelShisha = new GameAlgorithms(
//  gameArray,
//  memoOthman,
//  board,
//  2,
//  1
//);
const AI = new GameAlgorithms(gameArray, memoKhedr, board, 2, 4);
//currentRound = 0;
const AIvsAI = async () => {
  for (let i = 0; i < 100; i++) {
    if (currentRound === 0) {
      if (i === 0) {
        playerOneDrawer.drawInitialHex();
        const initialHex = map.querySelector(".hexagon");
        gameArray.push({
          hexHTML: map.querySelector(".hexagon"),
          hex: new Hex(0, 0),
          player: 1,
          type: new SpiderHex(0, 0),
          insectName: "spider",
        });
        initialHex.style.background = `url(./assets/black_spider.png)`;
        initialHex.classList.add("hex-background");
      } else {
        const bestMove = khedrKarawita.alphaBeta();
        console.log(bestMove);
        if (!bestMove.originalPieceHex) {
          const hexHTML = playerOneDrawer.drawForAI(
            bestMove.possibleMoveHex,
            bestMove.player === 1 ? "black" : "white",
            bestMove.insectName
          );
          const type = constructInsectObject(
            bestMove.insectName,
            bestMove.possibleMoveHex
          );
          type.stack = bestMove.possibleMoveHex.stack;
          gameArray.push(
            constructHexObject(
              hexHTML,
              bestMove.possibleMoveHex,
              bestMove.player
            )
          );
        } else {
          const hexObjToMutate = gameArray.filter(
            (hexObj) =>
              hexObj.hex.isEqual(bestMove.originalPieceHex) &&
              hexObj.hex.stack === bestMove.originalPieceHex.stack &&
              hexObj.player === bestMove.player
          )[0];
          map.removeChild(hexObjToMutate.hexHTML);
          khedrKarawita.simulatePlacingPossibleMoveInGameArray(
            bestMove,
            "apply"
          );
          const hexHTML = playerOneDrawer.drawForAI(
            bestMove.possibleMoveHex,
            bestMove.player === 1 ? "black" : "white",
            bestMove.insectName
          );
          hexObjToMutate.hexHTML = hexHTML;
        }
      }
    } else {
      if (i === 1) {
        const hexHTML = playerTwoDrawer.drawForAI(
          new Hex(0, 1),
          "white",
          "spider"
        );
        gameArray.push({
          hexHTML: hexHTML,
          hex: new Hex(0, 1),
          player: 2,
          type: new SpiderHex(0, 1),
          insectName: "spider",
        });
        hexHTML.style.background;
        hexHTML.classList.add("hex-background");
      } else {
        const bestMove = othmanAbdelJaleelShisha.alphaBeta();
        if (!bestMove.originalPieceHex) {
          const hexHTML = playerOneDrawer.drawForAI(
            bestMove.possibleMoveHex,
            bestMove.player === 1 ? "black" : "white",
            bestMove.insectName
          );
          const type = constructInsectObject(
            bestMove.insectName,
            bestMove.possibleMoveHex
          );
          type.stack = bestMove.possibleMoveHex.stack;
          gameArray.push(
            constructHexObject(
              hexHTML,
              bestMove.possibleMoveHex,
              bestMove.player
            )
          );
        } else {
          const hexObjToMutate = gameArray.filter(
            (hexObj) =>
              hexObj.hex.isEqual(bestMove.originalPieceHex) &&
              hexObj.hex.stack === bestMove.originalPieceHex.stack &&
              hexObj.player === bestMove.player
          )[0];
          map.removeChild(hexObjToMutate.hexHTML);
          othmanAbdelJaleelShisha.simulatePlacingPossibleMoveInGameArray(
            bestMove,
            "apply"
          );
          const hexHTML = playerOneDrawer.drawForAI(
            bestMove.possibleMoveHex,
            bestMove.player === 1 ? "black" : "white",
            bestMove.insectName
          );
          hexObjToMutate.hexHTML = hexHTML;
        }
      }
    }
    const khedrQueen = gameArray.filter(
      (hexObj) => hexObj.player === 1 && hexObj.insectName === "queen"
    )[0];
    const othmanQueen = gameArray.filter(
      (hexObj) => hexObj.player === 2 && hexObj.insectName === "queen"
    )[0];
    if (khedrQueen && othmanQueen) {
      const othmanQueenNeighbors = getNeighbors(
        gameArray,
        othmanQueen.hex
      ).filter((hexObj) => hexObj.hex.stack === 0);
      const khedrQueenNeighbors = getNeighbors(
        gameArray,
        khedrQueen.hex
      ).filter((hexObj) => hexObj.hex.stack === 0);
      if (othmanQueenNeighbors.length === 6) alert("Khedr Karawita wins!");
      else if (khedrQueenNeighbors.length === 6)
        alert("Othman abdeljaleel shisha wins!");
    }
    currentRound = (currentRound + 1) % 2;
    togglePlayers();
    async function waitFor(seconds) {
      return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }

    // Example usage: wait for 2500 seconds
    await waitFor(3).then(() => {
      console.log("Finished waiting for 2500 seconds.");
    });
  }
};
map.addEventListener("click", (e) => {
  if (e.target.style.background) currentCard = e.target;
  if (!currentCard) return alert("FUCK YOU CHOOSE AN INSECT FOR FUCK SAKE");
  let gameDrawer = currentRound == 1 ? playerOneDrawer : playerTwoDrawer;

  if (gameArray.length == 0) {
    handleRoundOne(gameDrawer, gameArray);
    return;
  }

  if (beginMovement.playerOne && currentRound == 0) {
    //!handle movement for player one or handle placement

    handleMovement(e, gameDrawer);
  }
  if (beginMovement.playerTwo && currentRound == 1) {
    //!handle movement for player two or handle placement
    handleMovement(e, gameDrawer);
  }
  handlePlacement(e, gameDrawer, gameArray);

  if (currentRound === 1) {
    console.time("Alpha Beta");
    console.log("Best move:");
    console.log(AI.alphaBeta());
    console.timeEnd("Alpha Beta");
    //console.log(board.mergeMovementsAndPlacement(2, 2, gameArray, null));
  }
  // console.log(gameArray);
  // console.log("Player to play: ", currentRound == 0 ? 1 : 2);
});
// AIvsAI();
