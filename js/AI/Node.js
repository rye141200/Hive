export default class Node {
  #id;
  #parentId;
  #childrenIds = [];
  #depth;
  #evaluation;
  #alpha;
  #beta;

  constructor(nodeId, parentNodeId, nodeEvaluation = null) {
    this.#id = nodeId;
    this.#parentId = parentNodeId;
    this.#evaluation = nodeEvaluation;
  }

  getId() {
    return this.#id;
  }

  getParentId() {
    return this.#parentId;
  }

  getChildrenIds() {
    return this.#childrenIds;
  }

  addChild(childNodeId) {
    this.#childrenIds.push(childNodeId);
  }

  removeChild(childNodeId) {
    for (let i = 0; i < this.#childrenIds.length; i++) {
      if (this.#childrenIds[i] === childNodeId) {
        this.#childrenIds.splice(i, 1);
        break;
      }
    }
  }

  getDepth() {
    return this.#depth;
  }

  setDepth(nodeDepth) {
    this.#depth = nodeDepth;
  }

  getEvaluation() {
    return this.#evaluation;
  }

  setEvaluation(nodeEvalution) {
    this.#evaluation = nodeEvalution;
  }

  getAlpha() {
    return this.#alpha;
  }

  setAlpha(nodeAlpha) {
    this.#alpha = nodeAlpha;
  }

  getBeta() {
    return this.#beta;
  }

  setBeta(nodeBeta) {
    this.#beta = nodeBeta;
  }
}
