const Node = require('./Node');
const { Token } = require("../../lexer/Token");

module.exports = class VarAssignNode extends Node {
    /**
     * @param {Token} varNameTok 
     * @param {Node} valueNode 
     */
    constructor(varNameTok, newValueNode) {
        super();
        this.varNameTok = varNameTok;
        this.newValueNode = newValueNode;

        this.posStart = this.varNameTok.posStart;
        this.posEnd = this.newValueNode.posEnd;

        this.name = "VarReAssignNode";
    }
}