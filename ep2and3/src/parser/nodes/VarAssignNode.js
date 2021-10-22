const Node = require('./Node');
const { Token } = require("../../lexer/Token");

module.exports = class VarAssignNode extends Node {
    /**
     * @param {Token} varNameTok 
     * @param {Node} valueNode 
     */
    constructor(varNameTok, valueNode) {
        super();
        this.varNameTok = varNameTok;
        this.valueNode = valueNode;

        this.posStart = this.varNameTok.posStart;
        this.posEnd = this.valueNode.posEnd;

        this.name = "VarAssignNode";
    }
}