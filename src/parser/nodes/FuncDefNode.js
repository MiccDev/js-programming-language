const Node = require('./Node');
const { Token } = require("../../lexer/Token");

module.exports = class FuncDefNode extends Node {
    /**
     * @param {Token} varNameTok 
     * @param {Token[]} argNameToks
     * @param {Node} bodyNode
     * @param {boolean|Node} shouldReturnNull
     */
    constructor(varNameTok, argNameToks, bodyNode, shouldReturnNull) {
        super();
        this.varNameTok = varNameTok;
        this.argNameToks = argNameToks;
        this.bodyNode = bodyNode;
        this.shouldReturnNull = shouldReturnNull;

        if(this.varNameTok) {
            this.posStart = this.varNameTok.posStart;
        } else if(this.argNameToks.length > 0) {
            this.posStart = this.argNameToks[0].posStart;
        } else {
            this.bodyNode.posStart;
        }

        this.posEnd = this.bodyNode.posEnd;

        this.name = "FuncDefNode";
    }

}