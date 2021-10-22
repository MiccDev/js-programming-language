const Node = require('./Node');
const { Token } = require("../../lexer/Token");

module.exports = class UnaryOpNode extends Node {
    /**
     * @param {Token} opTok 
     * @param {Node} node
     */
    constructor(opTok, node) {
        super();
        this.opTok = opTok;
        this.node = node;

        this.posStart = this.opTok.posStart;
        this.posEnd = this.node.posEnd;

        this.name = "UnaryOpNode";
    }

    toString() {
        return `(${this.opTok.toString()}, ${this.node.toString()})`;
    }
}