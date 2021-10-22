const Positon = require('./Position');
const { constants, Token, TokenTypes } = require('./Token');
const { IllegalCharError, ExpectedCharError } = require('../errors/index');

module.exports = class Lexer {
    /**
     * @param {string} fn 
     * @param {string} data 
     */
    constructor(fn, data) {
        this.fn = fn;
        this.data = data;
        this.currentChar = null;
        this.pos = new Positon(-1, 0, -1, fn, data);
        this.advance();
    }

    advance() {
        this.pos.advance(this.currentChar);
        this.currentChar = this.pos.idx < this.data.length ? this.data[this.pos.idx] : null;
    }

    makeTokens() {
        let tokens = [];

        while(this.currentChar != null) {
            if(" \t\r\n".includes(this.currentChar)) {
                this.advance();
            } else if(constants.numbers.includes(this.currentChar)) {
                tokens.push(this.makeNumber());
            } else if(constants.letters.includes(this.currentChar)) {
                tokens.push(this.makeIdentifier());
            } else if(this.currentChar == '+') {
                tokens.push(new Token(TokenTypes.PLUS, null, this.pos));
                this.advance();
            } else if(this.currentChar == '-') {
                tokens.push(new Token(TokenTypes.MINUS, null, this.pos));
                this.advance();
            } else if(this.currentChar == '*') {
                tokens.push(new Token(TokenTypes.MUL, null, this.pos));
                this.advance();
            } else if(this.currentChar == '/') {
                tokens.push(new Token(TokenTypes.DIV, null, this.pos));
                this.advance();
            } else if(this.currentChar == '^') {
                tokens.push(new Token(TokenTypes.POW, null, this.pos));
                this.advance();
            } else if(this.currentChar == '=') {
                let { token, error } = this.makeArrow();
                if(error) return { tokens: null, error: error };
                tokens.push(token);
            } else if(this.currentChar == '!') {
                let { token, error } = this.makeNotEqual();
                if(error) return { tokens: null, error: error };
                tokens.push(token);
            } else if(this.currentChar == '<') {
                tokens.push(this.makeLesserThan());
            } else if(this.currentChar == '>') {
                tokens.push(this.makeGreaterThan());
            } else if(this.currentChar == '(') {
                tokens.push(new Token(TokenTypes.LPAREN, null, this.pos));
                this.advance();
            } else if(this.currentChar == ')') {
                tokens.push(new Token(TokenTypes.RPAREN, null, this.pos));
                this.advance();
            } else {
                let posStart = this.pos.copy();
                let char = this.currentChar;
                this.advance();
                return { tokens: null, error: new IllegalCharError(posStart, this.pos, `'${char}'`) };
            }
        }

        tokens.push(new Token(TokenTypes.EOF, null, this.pos));
        return { tokens: tokens, error: null };
    }

    makeNotEqual() {
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '=') {
            this.advance();
            return { token: new Token(TokenTypes.NE, null, posStart, this.pos), error: null};
        }

        this.advance();
        return { token: null, error: new ExpectedCharError(posStart, this.pos, "'=' (after '!')") }
    }

    makeLesserThan() {
        let tokType = TokenTypes.LT;
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '=') {
            this.advance();
            tokType = TokenTypes.LTE;
        }

        return new Token(tokType, null, posStart, this.pos);
    }

    makeGreaterThan() {
        let tokType = TokenTypes.GT;
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '=') {
            this.advance();
            tokType = TokenTypes.GTE;
        }

        return new Token(tokType, null, posStart, this.pos);
    }

    makeArrow() {
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == ">") {
            this.advance();
            return { token: new Token(TokenTypes.ARROW, null, posStart, this.pos), error: null };
        } else if(this.currentChar == "=") {
            this.advance();
            return { token: new Token(TokenTypes.EE, null, posStart, this.pos), error: null };
        }

        return { token: null, error: new ExpectedCharError(posStart, this.pos, `'>' or '=' (after '=')`) };
    }

    makeNumber() {
        let numStr = "";
        let dotCount = 0;
        let posStart = this.pos.copy();
        let digits = constants.numbers;
        digits += ".";

        while(this.currentChar != null && digits.includes(this.currentChar)) {
            if(this.currentChar == ".") {
                if(dotCount == 1) break;
                dotCount++;
            }
            numStr += this.currentChar;
            this.advance();
        }

        if(dotCount == 0) {
            return new Token(TokenTypes.INT, parseInt(numStr), posStart, this.pos);
        } else {
            return new Token(TokenTypes.FLOAT, parseFloat(numStr), posStart, this.pos);
        }
    }

    makeIdentifier() {
        let idStr = "";
        let posStart = this.pos.copy();
        let letterNumbers = constants.letters + constants.numbers;

        while(this.currentChar != null && letterNumbers.includes(this.currentChar)) {
            idStr += this.currentChar;
            this.advance();
        }

        let tokType = TokenTypes.KEYWORDS.includes(idStr) ? TokenTypes.KEYWORD : TokenTypes.IDENTIFIER;
        return new Token(tokType, idStr, posStart, this.pos);
    }

}