const { Token } = require('../../lexer/Token');
const Node = require("./Node");

module.exports = class ForNode extends Node {
    /**
     * @param {Token} varNameTok 
     * @param {Node} startValueNode 
     * @param {Node} endValueNode 
     * @param {Node} stepValueNode 
     * @param {Node} bodyNode 
     */
    constructor(varNameTok, startValueNode, endValueNode, stepValueNode, bodyNode) {
        super();
        this.varNameTok = varNameTok;
        this.startValueNode = startValueNode;
        this.endValueNode = endValueNode;
        this.stepValueNode = stepValueNode;
        this.bodyNode = bodyNode;

        this.posStart = this.varNameTok.posStart;
        this.posEnd = this.bodyNode.posEnd;

        this.name = "ForNode";
    }
}