const Position = require('./Position');

module.exports.TokenTypes = Object.freeze({
    INT: "INT",
    FLOAT: "FLOAT",
    STRING: "STRING",
    IDENTIFIER: "IDENTIFIER",
    KEYWORD: "KEYWORD",
    // MATH
    PLUS: "PLUS", // +
    MINUS: "MINUS", // -
    MUL: "MUL", // *
    DIV: "DIV", // /
    // POW: "POW",
    LPAREN: "LPAREN",
    RPAREN: "RPAREN",
    EOF: "EOF",
    KEYWORDS: [
        "push"
    ]
});

module.exports.constants = Object.freeze({
    numbers: "0123456789",
    letters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
});

module.exports.Token = class Token {
    /**
     * @param {string} type_ 
     * @param {string} value 
     * @param {Position} posStart 
     * @param {Position} posEnd 
     */
    constructor(type_, value, posStart, posEnd) {
        this.type = type_;
        this.value = value;
        if(posStart) {
            this.posStart = posStart.copy();
            this.posEnd = posStart.copy();
            this.posEnd.advance();
        }
        if(posEnd)
            this.posEnd = posEnd;
    }

    /**
     * @returns {boolean}
     */
    matches(type_, value) {
        return this.type == type_ && this.value == value;
    }

    /**
     * @returns {string}
     */
    toString() {
        if(this.value) return `${this.type}:${this.value}`;
        return this.type;
    }
}