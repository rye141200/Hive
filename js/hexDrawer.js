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
  drawHighlightedMovementsForAnInsect(allowedMoves) {
    //!1) Erase all highlighted possible placements
    this.eraseAllPossibleHex();
    //!2) Draw the possible moves by coordinates {hex,direction}
    allowedMoves.forEach((move) => this.drawByAbsoluteCoordinates(move));
  }
  /**
   * q even => 50% + ((r-s)/2) * vertical spacing
   */
  drawByAbsoluteCoordinates(hex) {
    const hexHTML = document.createElement("div");
    hexHTML.classList.add(this.highlightedHex);
    hexHTML.style.top = `calc(50% + ${(hex.r - hex.s) / 2} * 1.732 * ${
      this.size + this.gap
    }px)`;
    hexHTML.style.left = `calc(50% + ${hex.q} * (3/2)*${
      this.size + this.gap
    }px)`;
    hexHTML.style.transform = "translate(-50%, -50%)";
    hexHTML.dataset.coordinates = hex.coordinates;
    this.hexContainer.appendChild(hexHTML);
    return hex;
  }
  drawInitialHex() {
    return this._drawHexByCoordinates("50%", "50%");
  }
  drawInitialInsect(insectHTML) {
    return this._drawInsectByCoordinates("50%", "50%", insectHTML);
  }
  drawHighlightedPossibleMoves(possibleMoves) {
    this.eraseAllPossibleHex();
    possibleMoves.map((possibleMoveObj) =>
      possibleMoveObj.possibleMoves.forEach((possibleMove) => {
        this.drawHex(
          possibleMove,
          possibleMoveObj.startCoordinates,
          this.highlightedHex
        );
      })
    );
  }
  eraseAllPossibleHex() {
    const possibleHexesHTML = [...this.hexContainer.children].filter(
      (hexHTML) => hexHTML.classList.contains("possible-hex")
    );
    possibleHexesHTML.forEach((possibleHexHTML) =>
      this.eraseHex(possibleHexHTML)
    );
  }
  eraseHex(hexHTML) {
    this.hexContainer.removeChild(hexHTML);
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
