import { generateAllNextAllowedPossibleMoves } from "/js/board.js";
import { generateAllNextPossibleMoves } from "/js/board.js";
import { Hex } from "/js/hex.js";

export const handleRoundOne = (
  gameDrawer,
  player,
  gameArray,
  playerOneSection,
  playerTwoSection,
  playerOneLabel,
  playerTwoLabel,
  currentCard,
  handleP1,
  handleP2
) => {
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
  player = 2;
  togglePlayers(
    player,
    playerOneSection,
    playerTwoSection,
    playerOneLabel,
    playerTwoLabel,
    currentCard,
    handleP1,
    handleP2
  );
};

// Helper methods
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

const togglePlayers = (
  player,
  playerOneSection,
  playerTwoSection,
  playerOneLabel,
  playerTwoLabel,
  currentCard,
  handleP1,
  handleP2
) => {
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

const resetCards = (cardsArray) => {
  cardsArray.forEach((card) => {
    if (card.classList.contains("dimmed-hex"))
      card.classList.remove("dimmed-hex");
    if (card.classList.contains("selected-hex"))
      card.classList.remove("selected-hex");
  });
};
