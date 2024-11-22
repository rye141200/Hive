export class GameHelpers {
  constructor() {}
  generateAllNextPossibleMoves = (hex) => {
    const directions = ["n", "ne", "nw", "s", "se", "sw"];
    return directions.map((direction) => {
      return { hex: hex.generateNextHex(direction), direction };
    });
  };
  generateAllNextAllowedPossibleMoves = (gameArray, player) => {
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

  constructHexObject = (hexHTML, hex, player) => {
    const insectType = hexHTML.style.background
      .match(/\/([a-z_]+)\.png/i)?.[1]
      .split("_")
      .pop();
    let type;
    if (insectType === "queen") type = new QueenHex(hex.q, hex.r, player);
    else if (insectType === "spider")
      type = new SpiderHex(hex.q, hex.r, player);
    else if (insectType === "beetle")
      type = new BeetleHex(hex.q, hex.r, player);
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
  constructStartCoordinates = (hexHTML, hex) => {
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
  resetCards = (cardsArray) => {
    cardsArray.forEach((card) => {
      if (card.classList.contains("dimmed-hex"))
        card.classList.remove("dimmed-hex");
      if (card.classList.contains("selected-hex"))
        card.classList.remove("selected-hex");
    });
  };
  selectCard = (cardsArray, clickedCard) => {
    resetCards(cardsArray);
    cardsArray.forEach((card) => {
      if (card != clickedCard) card.classList.add("dimmed-hex");
    });
    clickedCard.classList.add("selected-hex");
  };
  handlePlayerSection = (section, e) => {
    const cardsArray = [
      ...[...section.children[1].children].map((div) => div.children[0]),
    ];
    const clickedCard = e.target;
    if (!cardsArray.includes(clickedCard)) return resetCards(cardsArray);
    selectCard(cardsArray, clickedCard);
    currentCard = clickedCard;
  };
  handleP1(event) {
    handlePlayerSection(playerOneSection, event);
  }
  handleP2(event) {
    handlePlayerSection(playerTwoSection, event);
  }
  disablePlayerPanels = () => {
    playerOneSection.removeEventListener("click", handleP1);
    playerTwoSection.removeEventListener("click", handleP2);
  };
  togglePlayers = () => {
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
  setInsectAssets = (insectHTML, id) => {
    insectHTML.style.background = `url(./assets/${id
      .split("-")
      .join("_")}.png)`;
    insectHTML.classList.add("hex-background");
    if (beginMovement.playerOne && id.split("-")[0] === "black")
      insectHTML.classList.add("can-hover");
    else if (beginMovement.playerTwo && id.split("-")[0] === "white")
      insectHTML.classList.add("can-hover");
  };
  decrementInsectCount = (id) => {
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
  enableHovering = (blackOrWhite) => {
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
}
