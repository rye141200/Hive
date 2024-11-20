import { hexDrawer } from "/js/hexDrawer.js";
import { Hex } from "/js/hex.js";

//! Selectors and global variables
const map = document.querySelector(".map");
// const playerSection = document.querySelectorAll(".player");
const playerOneSection = document.querySelector(".player-1");
const playerTwoSection = document.querySelector(".player-2");
const playerOneLabel = document.querySelector("#player-one");
const playerTwoLabel = document.querySelector("#player-two");

const gameArray = [];
const playerOneDrawer = new hexDrawer(40, map, 1.5, "hexagon", "possible-hex");
const playerTwoDrawer = new hexDrawer(
  40,
  map,
  1.5,
  "hexagon-2",
  "possible-hex"
);

let player = 1;
let currentCard = null;
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
  //!2) Generate all possible moves from the played enemy cards
  const allPossibleMovesFromEnemy = enemyPlayedHexObjs.flatMap(
    (enemyPlayedHexObj) => generateAllNextPossibleMoves(enemyPlayedHexObj.hex)
  );
  //!3) Exclude the moves which have been already by any of the players
};

/**
 * Not allowed to move any piece untill you play queen
 * phase 1
 * phase 2
 */

const constructHexObject = (hexHTML, hex, player) => {
  return {
    hexHTML,
    hex,
    player,
  };
};
const constructStartCoordinates = (hexHTML, hex) => {
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

/** */
function handleP1(event) {
  handlePlayerSection(playerOneSection, event);
}
function handleP2(event) {
  handlePlayerSection(playerTwoSection, event);
}
/** */

const togglePlayers = () => {
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
};
const decrementInsectCount = (id) => {
  const el = document.querySelector(`#${id}`);
  const span = el.nextElementSibling;
  const temp = span.textContent.split("x")[1];
  let counter = +span.textContent.split("x")[0];
  console.log(counter);
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
//! Listeners
togglePlayers();

map.addEventListener("click", (e) => {
  if (!currentCard) return alert("FUCK YOU CHOOSE AN INSECT FOR FUCK SAKE");
  let gameDrawer = player == 1 ? playerOneDrawer : playerTwoDrawer;

  if (gameArray.length == 0) {
    //!1) Draw the starting hexagon
    //const startHexagon = gameDrawer.drawInitialHex();
    const insectHTML = gameDrawer.drawInitialHex();
    setInsectAssets(insectHTML, currentCard.id);
    decrementInsectCount(currentCard.id);

    //!2) Construct the hexObj, add it to the gameArray, hexObj contains hexHTML,hex,player
    const hexObj = constructHexObject(insectHTML, new Hex(0, 0), 1);
    gameArray.push(hexObj);

    //!3) Construct the start coordinates (the point where we will draw from)
    const startCoordinates = constructStartCoordinates(insectHTML, hexObj.hex);

    //!4) Draw all possible next moves

    gameDrawer.drawHighlightedPossibleMoves(
      generateAllNextPossibleMoves(gameArray[0].hex),
      startCoordinates,
      gameArray
    );
    player = 2;
    togglePlayers();

    return;
  }

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

  const startCoordinates = constructStartCoordinates(possibleHex, hexObj.hex);

  //!3) Drawing the possible highlighted moves
  gameArray.push(hexObj);
  player = gameArray[gameArray.length - 1].player == 1 ? 2 : 1;
  togglePlayers();
  gameDrawer.drawHighlightedPossibleMoves(
    generateAllNextPossibleMoves(gameArray[gameArray.length - 1].hex),
    startCoordinates,
    gameArray
  );

  //const previousPlayer = gameArray[gameArray.length - 1].player;
});
