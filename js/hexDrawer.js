import { generateAllNextPossibleMoves } from "/js/board.js";
function addToSet(set, newHexDirection) {
  if (
    ![...set].some(
      (hexDirection) =>
        hexDirection.hex.coordinates === newHexDirection.hex.coordinates
    )
  )
    set.push(newHexDirection);
}
const filterAdjacentOpponentHex = (gameArray, player) => {
  const enemies = gameArray
    .filter((hexObj) => hexObj.player != player)
    .map((hexObj) => hexObj.hex);
  const positionSet = [];
  enemies
    .flatMap((enemy) => generateAllNextPossibleMoves(enemy))
    .forEach((enemy) => addToSet(positionSet, enemy));
  return positionSet.filter(
    (possibleMove) =>
      !gameArray
        .map((hexObj) => hexObj.hex.coordinates)
        .includes(possibleMove.hex.coordinates)
  );
};
export class hexDrawer {
  size;
  gap;
  hexType;
  hexContainer;
  highlightedHex;
  constructor(
    size,
    hexContainer,
    gap = 1,
    hexType = "hexagon",
    highlightedHex = "possible-hex"
  ) {
    this.size = size;
    this.gap = gap;
    this.hexType = hexType;
    this.hexContainer = hexContainer;
    this.highlightedHex = highlightedHex;
  }
  drawInitialHex() {
    return this._drawHexByCoordinates("50%", "50%");
  }
  drawInitialInsect(insectHTML) {
    return this._drawInsectByCoordinates("50%", "50%", insectHTML);
  }
  drawHighlightedPossibleMoves(possibleMoves, startCoordinates, gameArray) {
    /* if (gameArray.length < 4) {
      const currentPlayer = gameArray[gameArray.length - 1].player == 1 ? 2 : 1;
      console.log(filterAdjacentOpponentHex(gameArray, currentPlayer));
      return filterAdjacentOpponentHex(gameArray, currentPlayer)
        .filter(
          (position) =>
            !possibleMoves
              .map((possibleMove) => possibleMove.hex.coordinates)
              .includes(position.coordinates)
        )
        .map((possibleMove) =>
          this.drawHex(possibleMove, startCoordinates, this.highlightedHex)
        );
    } else */
    return possibleMoves
      .filter(
        (possibleMove) =>
          !gameArray
            .map((hexObj) => hexObj.hex.coordinates)
            .includes(possibleMove.hex.coordinates)
      )
      .map((possibleMove) =>
        this.drawHex(possibleMove, startCoordinates, this.highlightedHex)
      );
  }
  drawHex(move, startCoordinates, hextype = this.hexType) {
    const axis = this._determineAxis(
      startCoordinates,
      move.hex,
      move.direction
    );
    this._drawHexByCoordinates(axis.left, axis.top, axis.coordinates, hextype);
    return move.hex;
  }
  _drawHexByCoordinates(
    left,
    top,
    coordinates = "(0,0)",
    hextype = this.hexType
  ) {
    const hex = document.createElement("div");
    hex.classList.add(hextype);
    hex.style.top = top;
    hex.style.left = left;
    hex.style.transform = "translate(-50%, -50%)";
    hex.dataset.coordinates = coordinates;
    this.hexContainer.appendChild(hex);
    return hex;
  }
  _drawInsectByCoordinates(left, top, insectHTML, coordinates = "(0,0)") {
    const placedInsectHTML = insectHTML.cloneNode(true);
    console.log(placedInsectHTML);
    placedInsectHTML.style.top = top;
    placedInsectHTML.style.left = left;
    placedInsectHTML.style.transform = "translate(-50%, -50%) !important";
    placedInsectHTML.dataset.coordinates = coordinates;
    this.hexContainer.appendChild(placedInsectHTML);
    return placedInsectHTML;
  }
  _determineAxis(startCoordinates, hex, direction) {
    if (direction === "n" || direction === "s")
      return {
        left: `calc(${startCoordinates.left})`,
        top: `calc(${startCoordinates.top}  + 1.732 * ${
          hex.r - startCoordinates.r
        } * ${this.size + this.gap}px)`,
        coordinates: `(${hex.q},${hex.r})`,
      };
    else if (direction === "ne" || direction === "sw")
      return {
        left: `calc(${startCoordinates.left} + ${
          hex.q - startCoordinates.q
        } * 3/2 * ${this.size + this.gap}px)`,
        top: `calc(${startCoordinates.top} + ${
          hex.r - startCoordinates.r
        } * 0.5 * 1.732 * ${this.size + this.gap}px)`,
        coordinates: `(${hex.q},${hex.r})`,
      };
    else if (direction === "nw" || direction === "se")
      return {
        left: `calc(${startCoordinates.left} + ${
          hex.q - startCoordinates.q
        } * 3/2 * ${this.size + this.gap}px)`,
        top: `calc(${startCoordinates.top} + ${
          hex.q - startCoordinates.q
        } * 0.5 * 1.732 * ${this.size + this.gap}px)`,
        coordinates: `(${hex.q},${hex.r})`,
      };
    return null;
  }
}
