import { hexDrawer } from "/js/hexDrawer.js";
import { Hex } from "/js/hex.js";
import { QueenHex } from "/js/queenHex.js";
import { BeetleHex } from "/js/beetleHex.js";
import { GrasshopperHex } from "/js/grasshopperHex.js";
import { AntHex } from "/js/antHex.js";
import { SpiderHex } from "/js/spiderHex.js";

//! Selectors and global variables
const map = document.querySelector(".map");
// const playerSection = document.querySelectorAll(".player");
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

  return allPossibleMovesFromPlayer;
};

export const constructHexObject = (hexHTML, hex, player) => {
  const insectType = hexHTML.style.background
    .match(/\/([a-z_]+)\.png/i)?.[1]
    .split("_")
    .pop();
  let type;
  if (insectType === "queen") type = new QueenHex(hex.q, hex.r, player);
  else if (insectType === "spider") type = new SpiderHex(hex.q, hex.r, player);
  else if (insectType === "beetle") type = new BeetleHex(hex.q, hex.r, player);
  else if (insectType === "ant") type = new AntHex(hex.q, hex.r, player);
  else if (insectType === "grasshopper")
    type = new GrasshopperHex(hex.q, hex.r, player);
  return {
    hexHTML,
    hex,
    player,
    type,
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
  }
  currentCard = null;
};
const setInsectAssets = (insectHTML, id) => {
  insectHTML.style.background = `url(./assets/${id.split("-").join("_")}.png)`;
  insectHTML.classList.add("hex-background");
  if (beginMovement.playerOne && id.split("-")[0] === "black")
    insectHTML.classList.add("can-hover");
  else if (beginMovement.playerTwo && id.split("-")[0] === "white")
    insectHTML.classList.add("can-hover");
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
//! Rounds
const roundFourRules = (gameArray, currentRound) => {
  if (
    !beginMovement.playerOne &&
    gameArray.some(
      (hexObj) =>
        hexObj.hexHTML.style.background
          .match(/\/([a-z_]+)\.png/i)?.[1]
          .split("_")
          .pop() === "queen" && hexObj.type.player === 1
    )
  )
    beginMovement.playerOne = true;
  if (
    !beginMovement.playerTwo &&
    gameArray.some(
      (hexObj) =>
        hexObj.hexHTML.style.background
          .match(/\/([a-z_]+)\.png/i)?.[1]
          .split("_")
          .pop() === "queen" && hexObj.type.player === 2
    )
  )
    beginMovement.playerTwo = true;

  const numberOfPlayedBlacks = gameArray.filter(
    (hexObj) => hexObj.player == 1
  ).length;
  const numberOfPlayedWhites = gameArray.filter(
    (hexObj) => hexObj.player == 2
  ).length;

  if (
    currentRound == 1 &&
    numberOfPlayedBlacks == 3 &&
    !beginMovement.playerOne
  ) {
    const cardsArray = [
      ...[...playerOneSection.children[1].children].map(
        (div) => div.children[0]
      ),
    ];
    currentCard = document.querySelector("#black-queen");
    cardsArray
      .filter((card) => card.id != currentCard.id)
      .forEach((card) => card.classList.add("dimmed-hex"));
    selectCard(cardsArray, currentCard);
    disablePlayerPanels();
    beginMovement.playerOne = true;
    return true;
  }
  if (
    currentRound == 0 &&
    numberOfPlayedWhites == 3 &&
    !beginMovement.playerTwo
  ) {
    const cardsArray = [
      ...[...playerTwoSection.children[1].children].map(
        (div) => div.children[0]
      ),
    ];
    currentCard = document.querySelector("#white-queen");
    cardsArray
      .filter((card) => card.id != currentCard.id)
      .forEach((card) => card.classList.add("dimmed-hex"));
    selectCard(cardsArray, currentCard);
    disablePlayerPanels();
    beginMovement.playerTwo = true;
    return true;
  }
  return false;
};
const handleRoundOne = (gameDrawer, gameArray) => {
  //!1) Draw the starting hexagon
  const insectHTML = gameDrawer.drawInitialHex();

  setInsectAssets(insectHTML, currentCard.id);
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
  roundFourRules(gameArray, currentRound);
  player = 2;
  togglePlayers();
};

const handlePlacement = (
  e,
  gameDrawer,
  gameArray,
  currentRound,
  beginMovement
) => {
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

  const hexObj = constructHexObject(
    possibleHex,
    new Hex(
      Number.parseInt(coordinatesArray[0]),
      Number.parseInt(coordinatesArray[1])
    ),
    gameArray[gameArray.length - 1].player == 1 ? 2 : 1
  );

  //!3) Drawing the possible highlighted moves

  gameArray.push(hexObj);
  player = gameArray[gameArray.length - 1].player == 1 ? 2 : 1;
  const noToggle = roundFourRules(gameArray, currentRound);
  if (!noToggle) togglePlayers();

  gameDrawer.drawHighlightedPossibleMoves(
    generateAllNextAllowedPossibleMoves(gameArray, player)
  );
};
const handleMovement = (e) => {
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

  const hexObj = constructHexObject(
    insectHTML,
    new Hex(
      Number.parseInt(coordinatesArray[0]),
      Number.parseInt(coordinatesArray[1])
    ),
    gameArray[gameArray.length - 1].player == 1 ? 2 : 1
  );
  console.log(hexObj);
  //!3) Generate the moves according to the type of the hexObj
  const moves = hexObj.type.generateAllowedPossibleMoves(gameArray);
  console.log(moves);
  //!4) Draw the possible moves

  //!5) Place the piece
};
//! Listeners
togglePlayers();

map.addEventListener("click", (e) => {
  //&& !e.target.classList.contains("hex")
  if (e.target.style.background) currentCard = e.target;
  if (!currentCard) return alert("FUCK YOU CHOOSE AN INSECT FOR FUCK SAKE");

  let gameDrawer = player == 1 ? playerOneDrawer : playerTwoDrawer;

  if (gameArray.length == 0) {
    handleRoundOne(gameDrawer, gameArray);
    currentRound = (currentRound + 1) % 2;
    /* if (beginMovement.playerOne && currentRound == 0) {
      //!handle movement for player one or handle placement
      if (enterThisSectionAgainPlayerOne) {
        enableHovering("black");
        enterThisSectionAgainPlayerOne = false;
      }
    } */
    return;
  }

  if (beginMovement.playerOne && currentRound == 0) {
    //!handle movement for player one or handle placement
    if (enterThisSectionAgainPlayerOne) {
      enableHovering("black");
      enterThisSectionAgainPlayerOne = false;
    }
    handleMovement(e);
  }
  if (beginMovement.playerTwo && currentRound == 1) {
    //! Handle movement for player two or handle placement
    if (enterThisSectionAgainPlayerTwo) {
      enableHovering("white");
      enterThisSectionAgainPlayerTwo = false;
    }
    handleMovement(e);
  }
  handlePlacement(e, gameDrawer, gameArray, currentRound, beginMovement);

  currentRound = (currentRound + 1) % 2;
});
