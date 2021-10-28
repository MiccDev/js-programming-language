const Position = require('src/lexer/Position');

module.exports.TokenTypes = Object.freeze({
    INT: "INT", // 1
    FLOAT: "FLOAT", // 1.12
    STRING: "STRING", // "Hello"
    IDENTIFIER: "IDENTIFIER", // str
    KEYWORD: "KEYWORD", // push
    // MATH
    PLUS: "PLUS", // +
    MINUS: "MINUS", // -
    MUL: "MUL", // *
    DIV: "DIV", // /
    POW: "POW", // ^
    LPAREN: "LPAREN", // (
    RPAREN: "RPAREN", // )
    ARROW: "ARROW", // =>
    EE: "EE", // ==
    NE: "NE", // !=
    LT: "LT", // <
    GT: "GT", // >
    GTE: "GTE", // >=
    LTE: "LTE", // <=
    COMMA: "COMMA", // ,
    LSQUARE: "LSQUARE", // [
    RSQUARE: "RSQUARE", // ]
    NEWLINE: "NEWLINE", // \n ;
    EOF: "EOF",
    KEYWORDS: [
        "push",
        ":",
        "&",
        "|",
        "if",
        "do",
        "elif",
        "else",
        "fin",
        "for",
        "while",
        "until",
        "inc",
        "define"
    ]
});

module.exports.constants = Object.freeze({
    numbers: "0123456789",
    letters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ|&:"
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