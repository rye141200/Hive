export default class Tree {

    #tree;
    #rootNodeId;

    #isAllEvaluated = false;
    #minimaxEvaluatedNodes = 0;
    #minimaxWithPruningEvaluatedNodes = 0;

    constructor(rootNode) {
        this.#tree = {};
        rootNode.setDepth(0);
        this.#rootNodeId = rootNode.getId();
        this.#tree[rootNode.getId()] = rootNode;
    }

    addNode(node) {
        this.#tree[node.getId()] = node;
        this.#tree[node.getParentId()].addChild(node.getId());
        this.#tree[node.getId()].setDepth(this.#tree[node.getParentId()].getDepth() + 1);
    }

    removeNode(nodeId) {

        const nodeChildernIds = this.#tree[nodeId].getChildrenIds();
    
        if(nodeChildernIds.length > 0){
            nodeChildernIds.forEach((childNodeId) => {
                this.removeNode(childNodeId);
            });
        }
    
        const parentNodeId = this.#tree[nodeId].getParentId();
        this.#tree[parentNodeId].removeChild(nodeId);
    
        delete this.#tree[nodeId];
    }

    getTree() {
        return this.#tree;
    }

    getMinimaxEvaluatedNodesCount() {
        return this.#minimaxEvaluatedNodes;
    }

    getMinimaxWithPruningEvaluatedNodesCount() {
        return this.#minimaxWithPruningEvaluatedNodes;
    }

    optimize() {

        if(!this.#isAllEvaluated)
            this.minimax();

        Object.keys(this.#tree).forEach((nodeId) => {
            if(this.#tree[nodeId].getChildrenIds().length > 1) {
                // maximizer
                if(this.#tree[nodeId].getDepth() % 2 === 0)
                    this.#orderChildrenDescending(this.#tree[nodeId]);
                // minimizer
                else
                    this.#orderChildrenAscending(this.#tree[nodeId]);
            }
        });
    }

    // order the array in ascending from left to right (for minimizer)
    #orderChildrenAscending(node) {

        let minIndex = 0;
        let minEvaluation;
        let childjEvaluation;

        for (let i=0; i<node.getChildrenIds().length; i++) {

            for (let j=0; j<(node.getChildrenIds().length-i); j++) {

                childjEvaluation = this.#tree[node.getChildrenIds()[j]].getEvaluation();
                minEvaluation = this.#tree[node.getChildrenIds()[minIndex]].getEvaluation();
                if(childjEvaluation < minEvaluation) {
                    minIndex = j;
                }
            }

            node.addChild(node.getChildrenIds()[minIndex]);
            node.removeChild(node.getChildrenIds()[minIndex])
            minIndex = 0;
        }
    }

    // order the array in descending from left to right (for maximaizer)
    #orderChildrenDescending(node) {

        let maxIndex = 0;
        let maxEvaluation;
        let childjEvaluation;

        for (let i=0; i<node.getChildrenIds().length; i++) {

            for (let j=0; j<(node.getChildrenIds().length-i); j++) {

                childjEvaluation = this.#tree[node.getChildrenIds()[j]].getEvaluation();
                maxEvaluation = this.#tree[node.getChildrenIds()[maxIndex]].getEvaluation();
                if(childjEvaluation > maxEvaluation) {
                    maxIndex = j;
                }
            }
            node.addChild(node.getChildrenIds()[maxIndex]);
            node.removeChild(node.getChildrenIds()[maxIndex])
            maxIndex = 0;
        }
    }

    minimax(nodeId=this.#rootNodeId, nodeAlpha=-999, nodeBeta=999) {

        const node = this.#tree[nodeId];
        const nodeChildernIds = node.getChildrenIds();
        node.setAlpha(nodeAlpha);
        node.setBeta(nodeBeta);

        if(node.getId() === this.#rootNodeId) {
            this.#isAllEvaluated = true;
            this.#minimaxEvaluatedNodes = 0;
        }

        if(nodeChildernIds.length === 0) {
            this.#minimaxEvaluatedNodes += 1;
            return node.getEvaluation();
        }
        else {

            for(let i=0; i<nodeChildernIds.length; i++) {

                let returnedEvaluation = this.minimax(nodeChildernIds[i], node.getAlpha(), node.getBeta());

                // maximizer
                if(node.getDepth()%2 === 0) {
                    if(node.getAlpha() < returnedEvaluation)
                        node.setAlpha(returnedEvaluation);
                }
                
                // minimizer
                else {
                    if(node.getBeta() > returnedEvaluation)
                        node.setBeta(returnedEvaluation);
                }
            }

            // maximizer
            if(node.getDepth()%2 === 0) {
                node.setEvaluation(node.getAlpha());
                return node.getEvaluation();
            }
            
            // minimizer
            else {
                node.setEvaluation(node.getBeta());
                return node.getEvaluation();
            }
        }
    }

    minimaxWithPruning(nodeId=this.#rootNodeId, nodeAlpha=-999, nodeBeta=999) {
    
        const node = this.#tree[nodeId];
        const nodeChildernIds = node.getChildrenIds();
        node.setAlpha(nodeAlpha);
        node.setBeta(nodeBeta);

        if(node.getId() === this.#rootNodeId) {
            this.#isAllEvaluated = true;
            this.#minimaxWithPruningEvaluatedNodes = 0;
        }

        if(nodeChildernIds.length === 0) {
            this.#minimaxWithPruningEvaluatedNodes += 1;
            return node.getEvaluation();
        }    
        else {

            for(let i=0; i<nodeChildernIds.length; i++) {

                let returnedEvaluation = this.minimaxWithPruning(nodeChildernIds[i], node.getAlpha(), node.getBeta());
                let parentNodeId = node.getParentId();
                // maximizer
                if(node.getDepth()%2 === 0) {
                    if(node.getAlpha() < returnedEvaluation) {
                        node.setAlpha(returnedEvaluation);
                        if((parentNodeId !== null) && (node.getAlpha() >= this.#tree[parentNodeId].getBeta())) {
                            break;
                        }
                    }
                }
                
                // minimizer
                else {
                    if(node.getBeta() > returnedEvaluation) {
                        node.setBeta(returnedEvaluation);
                        if((parentNodeId !== null) && (node.getBeta() <= this.#tree[parentNodeId].getAlpha())) {
                            break;
                        }
                    }
                }
            }
                
            // maximizer
            if(node.getDepth()%2 === 0) {
                node.setEvaluation(node.getAlpha());
                return node.getEvaluation();
            }
            // minimizer
            else {
                node.setEvaluation(node.getBeta());
                return node.getEvaluation();
            }
        }
    }
}