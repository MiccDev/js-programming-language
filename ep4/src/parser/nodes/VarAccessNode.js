const Node = require('./Node');
const { Token } = require("../../lexer/Token");

module.exports = class VarAccessNode extends Node {
    /**
     * @param {Token} varNameTok 
     */
    constructor(varNameTok) {
        super();
        this.varNameTok = varNameTok;

        this.posStart = this.varNameTok.posStart;
        this.posEnd = this.varNameTok.posEnd;

        this.name = "VarAccessNode";
    }
}