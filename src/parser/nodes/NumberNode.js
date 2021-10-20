const Node = require('./Node');
const { Token } = require("../../lexer/Token");

module.exports = class NumberNode extends Node {
    /**
     * @param {Token} tok 
     */
    constructor(tok) {
        super();
        this.tok = tok;

        this.posStart = this.tok.posStart;
        this.posEnd = this.tok.posEnd;

        this.name = "NumberNode";
    }

    toString() {
        return `${this.tok.toString()}`;
    }
}