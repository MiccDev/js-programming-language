const Node = require('./Node');
const { Token } = require("../../lexer/Token");

module.exports = class BinOpNode extends Node {
    /**
     * @param {Node} leftNode
     * @param {Token} opTok 
     * @param {Node} rightNode
     */
    constructor(leftNode, opTok, rightNode) {
        super();
        this.leftNode = leftNode;
        this.opTok = opTok;
        this.rightNode = rightNode;

        this.posStart = this.leftNode.posStart;
        this.posEnd = this.rightNode.posEnd;

        this.name = "BinOpNode";
    }

    toString() {
        return `(${this.leftNode.toString()}, ${this.opTok.toString()}, ${this.rightNode.toString()})`;
    }
}