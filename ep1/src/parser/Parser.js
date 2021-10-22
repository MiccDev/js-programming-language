const { InvalidSyntaxError } = require('../errors');
const { TokenTypes, Token } = require('../lexer/Token');
const ParseResult = require("./ParseResult");
const {
    UnaryOpNode,
    BinOpNode,
    NumberNode
} = require('./nodes/index');

module.exports = class Parser {
    /**
     * @param {Token[]} tokens 
     */
    constructor(tokens) {
        this.tokens = tokens;
        this.tokIdx = -1;
        this.advance();
    }

    /**
     * @returns {Token}
     */
    advance() {
        this.tokIdx++;
        this.updateCurrentTok();
        return this.currentTok;
    }

    updateCurrentTok() {
        if(this.tokIdx >= 0 && this.tokIdx < this.tokens.length) {
            this.currentTok = this.tokens[this.tokIdx];
        }
    }

    /**
     * @returns {ParseResult}
     */
    parse() {
        let res = this.expr();
        if(!res.error && this.currentTok.type != TokenTypes.EOF) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                "Expected '+', '-', '*' or '/'"
            ));
        }
        return res;
    }

    // ###############################################################

    /**
     * @returns {ParseResult}
     */
    factor() {
        let res = new ParseResult();
        let tok = this.currentTok;

        if([TokenTypes.PLUS, TokenTypes.MINUS].includes(this.currentTok.type)) {
            res.registerAdvancement();
            this.advance();
            let factor = res.register(this.factor());
            if(res.error) return res;
            return res.success(new UnaryOpNode(tok, factor));
        } else if([TokenTypes.INT, TokenTypes.FLOAT].includes(this.currentTok.type)) {
            res.registerAdvancement();
            this.advance();
            return res.success(new NumberNode(tok));
        } else if(tok.type == TokenTypes.LPAREN) {
            res.registerAdvancement();
            this.advance();
            let expr = res.register(this.expr());
            if(res.error) return res;
            if(this.currentTok.type == TokenTypes.RPAREN) {
                res.registerAdvancement();
                this.advance();
                return res.success(expr);
            } else {
                return res.failure(new InvalidSyntaxError(
                    this.currentTok.posStart, this.currentTok.posEnd,
                    "Expected ')'"
                ));
            }
        }

        return res.failure(new InvalidSyntaxError(
            tok.posStart, tok.posEnd,
            "Expected int or float"
        ));
    }

    /**
     * @returns {ParseResult}
     */
    term() {
        return this.binOp(this.factor.bind(this), [TokenTypes.MUL, TokenTypes.DIV]);
    }

    /**
     * @returns {ParseResult}
     */
    expr() {
        return this.binOp(this.term.bind(this), [TokenTypes.PLUS, TokenTypes.MINUS]);
    }

    // ###############################################################

    /**
     * 
     * @param {Function} funcA 
     * @param {string[]} ops 
     * @param {Function} funcB 
     * @returns {ParseResult}
     */
    binOp(funcA, ops, funcB=null) {
        if(funcB == null) {
            funcB = funcA;
        }

        let res = new ParseResult();
        let left = res.register(funcA());
        if(res.error) return res;

        while(ops.includes(this.currentTok.type) || ops.includes(this.currentTok.type + this.currentTok.value)) {
            let opTok = this.currentTok;
            res.registerAdvancement();
            this.advance();
            let right = res.register(funcB());
            if(res.error) return res;
            left = new BinOpNode(left, opTok, right);
        }

        return res.success(left);
    }

}