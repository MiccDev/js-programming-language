const Node = require("./Node");

module.exports = class ForNode extends Node {
    /**
     * @param {Node} conditionNode 
     * @param {Node} bodyNode 
     */
    constructor(conditionNode, bodyNode) {
        super();
        this.conditionNode = conditionNode;
        this.bodyNode = bodyNode;

        this.posStart = this.conditionNode.posStart;
        this.posEnd = this.bodyNode.posEnd;

        this.name = "ForNode";
    }
}