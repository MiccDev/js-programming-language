const { InvalidSyntaxError } = require('../errors');
const { TokenTypes, Token } = require('../lexer/Token');
const ParseResult = require("./ParseResult");
const {
    UnaryOpNode,
    BinOpNode,
    NumberNode,
    VarAccessNode,
    VarAssignNode,
    IfNode,
    ForNode,
    WhileNode,
    CallNode,
    FuncDefNode,
    StringNode,
    ListNode
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
                "Expected '+', '-', '*', '/', '^', '==', '!=', '<', '>', '<=', '>=', '&', or '|'"
            ));
        }
        return res;
    }

    // ###############################################################

    /**
     * @returns {ParseResult}
     */
    atom() {
        let res = new ParseResult();
        let tok = this.currentTok;

        if([TokenTypes.INT, TokenTypes.FLOAT].includes(tok.type)) {
            res.registerAdvancement();
            this.advance();
            return res.success(new NumberNode(tok));
        } else if(tok.type == TokenTypes.IDENTIFIER) {
            res.registerAdvancement();
            this.advance();
            return res.success(new VarAccessNode(tok));
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
        } else if(tok.type == TokenTypes.STRING) {
            res.registerAdvancement();
            this.advance();
            return res.success(new StringNode(tok));
        } else if(tok.type == TokenTypes.LSQUARE) {
            let listExpr = res.register(this.listExpr());
            if(res.error) return res;
            return res.success(listExpr);
        } else if(tok.matches(TokenTypes.KEYWORD, "if")) {
            let ifExpr = res.register(this.ifExpr());
            if(res.error) return res;
            return res.success(ifExpr);
        } else if(tok.matches(TokenTypes.KEYWORD, "for")) {
            let forExpr = res.register(this.forExpr());
            if(res.error) return res;
            return res.success(forExpr);
        } else if(tok.matches(TokenTypes.KEYWORD, "while")) {
            let whileExpr = res.register(this.whileExpr());
            if(res.error) return res;
            return res.success(whileExpr);
        } else if(tok.matches(TokenTypes.KEYWORD, "define")) {
            let funcDef = res.register(this.funcDef());
            if(res.error) return res;
            return res.success(funcDef);
        }

        return res.failure(new InvalidSyntaxError(
            tok.posStart, tok.posEnd,
            "Expected int or float, identifier, '+', '-', '(', 'if', 'for', 'while' or 'define'"
        ));
    }

    call() {
        let res = new ParseResult();
        let atom = res.register(this.atom());
        if(res.error) return res;

        if(this.currentTok.type == TokenTypes.LPAREN) {
            res.registerAdvancement();
            this.advance();
            let argNodes = [];

            if(this.currentTok.type == TokenTypes.RPAREN) {
                res.registerAdvancement();
                this.advance();
            } else {
                argNodes.push(res.register(this.expr()));
                if(res.error) {
                    return res.failure(new InvalidSyntaxError(
                        this.currentTok.posStart, this.currentTok.posEnd,
                        `Expected ')', 'push', 'if', 'for', 'while', 'define', int, float, identifier, '+', '-', '(' or ':'`
                    ));
                }

                while(this.currentTok.type == TokenTypes.COMMA) {
                    res.registerAdvancement();
                    this.advance();

                    argNodes.push(res.register(this.expr()));
                    if(res.error) return res;
                }

                if(this.currentTok.type != TokenTypes.RPAREN) {
                    return res.failure(new InvalidSyntaxError(
                        this.currentTok.posStart, this.currentTok.posEnd,
                        `Expected ',' or ')'`
                    ));
                }

                res.registerAdvancement();
                this.advance();
            }
            return res.success(new CallNode(atom, argNodes));
        }
        return res.success(atom);
    }

    /**
     * @returns {ParseResult}
     */
    power() {
        return this.binOp(this.call.bind(this), [TokenTypes.POW], this.factor.bind(this));
    }

    /**
     * @returns {ParseResult}
     */
    factor() {
        let res = new ParseResult();
        let tok = this.currentTok;

        if([TokenTypes.PLUS, TokenTypes.MINUS].includes(tok.type)) {
            res.registerAdvancement();
            this.advance();
            let factor = res.register(this.factor());
            if(res.error) return res;
            return res.success(new UnaryOpNode(tok, factor));
        }

        return this.power();
    }

    /**
     * @returns {ParseResult}
     */
    term() {
        return this.binOp(this.factor.bind(this), [TokenTypes.MUL, TokenTypes.DIV]);
    }

    arithExpr() {
        return this.binOp(this.term.bind(this), [TokenTypes.PLUS, TokenTypes.MINUS]);
    }

    compExpr() {
        let res = new ParseResult();

        if(this.currentTok.matches(TokenTypes.KEYWORD, '!')) {
            let opTok = this.currentTok;
            res.registerAdvancement();
            this.advance();

            var node = res.register(this.compExpr());
            if(res.error) return res;
            return res.success(new UnaryOpNode(opTok, node));
        }

        node = res.register(this.binOp(this.arithExpr.bind(this), [TokenTypes.EE, TokenTypes.NE, TokenTypes.LT, TokenTypes.GT, TokenTypes.LTE, TokenTypes.GTE]));

        if(res.error) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                "Expected int, float, identifier, '+', '-', '(', or ':'"
            ));
        }

        return res.success(node);
    }

    /**
     * @returns {ParseResult}
     */
    expr() {
        let res = new ParseResult();

        if(this.currentTok.matches(TokenTypes.KEYWORD, 'push')) {
            res.registerAdvancement();
            this.advance();

            if(this.currentTok.type != TokenTypes.IDENTIFIER) {
                return res.failure(new InvalidSyntaxError(
                    this.currentTok.posStart, this.currentTok.posEnd,
                    "Expected identifer"
                ));
            }

            let varName = this.currentTok;
            res.registerAdvancement();
            this.advance();

            if(this.currentTok.type != TokenTypes.ARROW) {
                return res.failure(new InvalidSyntaxError(
                    this.currentTok.posStart, this.currentTok.posEnd,
                    "Expected '=>'"
                ));
            }

            res.registerAdvancement();
            this.advance();
            let expr = res.register(this.expr());
            if(res.error) return res;
            return res.success(new VarAssignNode(varName, expr));
        }

        let node = res.register(this.binOp(this.compExpr.bind(this), [(TokenTypes.KEYWORD + '&'), (TokenTypes.KEYWORD + '|')]));

        if(res.error) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                "Expected 'push', int, float, identifier, '+', '-', '(' or ':'"
            ));
        }

        return res.success(node);
    }

    funcDef() {
        let res = new ParseResult();

        if(!this.currentTok.matches(TokenTypes.KEYWORD, "define")) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                "Expected 'define'"
            ));
        }

        res.registerAdvancement();
        this.advance();

        if(this.currentTok.type == TokenTypes.IDENTIFIER) {
            var varNameTok = this.currentTok;
            res.registerAdvancement();
            this.advance();
            if(this.currentTok.type != TokenTypes.LPAREN) {
                return res.failure(new InvalidSyntaxError(
                    this.currentTok.posStart, this.currentTok.posEnd,
                    "Expected '('"
                ));
            }
        } else {
            varNameTok = null;
            if(this.currentTok.type != TokenTypes.LPAREN) {
                return res.failure(new InvalidSyntaxError(
                    this.currentTok.posStart, this.currentTok.posEnd,
                    "Expected identifier or '('"
                ));
            }
        }

        res.registerAdvancement();
        this.advance();
        let argNameToks = [];

        if(this.currentTok.type == TokenTypes.IDENTIFIER) {
            argNameToks.push(this.currentTok);
            res.registerAdvancement();
            this.advance();

            while(this.currentTok.type == TokenTypes.COMMA) {
                res.registerAdvancement();
                this.advance();

                if(this.currentTok.type != TokenTypes.IDENTIFIER) {
                    return res.failure(new InvalidSyntaxError(
                        this.currentTok.posStart, this.currentTok.posEnd,
                        "Expected identifier"
                    ));
                }

                argNameToks.push(this.currentTok);
                res.registerAdvancement();
                this.advance();
            }

            if(this.currentTok.type != TokenTypes.RPAREN) {
                return res.failure(new InvalidSyntaxError(
                    this.currentTok.posStart, this.currentTok.posEnd,
                    "Expected ',' or ')'"
                ));
            }
        } else {
            if(this.currentTok.type != TokenTypes.RPAREN) {
                return res.failure(new InvalidSyntaxError(
                    this.currentTok.posStart, this.currentTok.posEnd,
                    "Expected identifier or ')'"
                ));
            }
        }

        res.registerAdvancement();
        this.advance();

        if(this.currentTok.type != TokenTypes.ARROW) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                "Expected '=>'"
            ));
        }

        res.registerAdvancement();
        this.advance();
        let nodeToReturn = res.register(this.expr());
        if(res.error) return res;

        return res.success(new FuncDefNode(
            varNameTok,
            argNameToks,
            nodeToReturn
        ));
    }

    listExpr() {
        let res = new ParseResult();
        let elementNodes = [];
        let posStart = this.currentTok.posStart.copy();

        if(this.currentTok.type != TokenTypes.LSQUARE) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                `Expected '['`
            ));
        }

        res.registerAdvancement();
        this.advance();

        if(this.currentTok.type == TokenTypes.RSQUARE) {
            res.registerAdvancement();
            this.advance();
        } else {
            elementNodes.push(res.register(this.expr()));
            if(res.error) {
                return res.failure(new InvalidSyntaxError(
                    this.currentTok.posStart, this.currentTok.posEnd,
                    "Expected ']', 'push', 'if', 'for', 'while', 'define', int, flot, identifier, '+', '-', '(', '[' or ':'"
                ));
            }

            while(this.currentTok.type == TokenTypes.COMMA) {
                res.registerAdvancement();
                this.advance();

                elementNodes.push(res.register(this.expr()));
                if(res.error) return res;
            }

            if(this.currentTok.type != TokenTypes.RSQUARE) {
                return res.failure(new InvalidSyntaxError(
                    this.currentTok.posStart, this.currentTok.posEnd,
                    "Expected ',' or ']'"
                ));
            }

            res.registerAdvancement();
            this.advance();
        }

        return res.success(new ListNode(
            elementNodes,
            posStart,
            this.currentTok.posEnd.copy()
        ));
    }

    ifExpr() {
        let res = new ParseResult();
        let cases = [];
        let elseCase = null;

        if(!this.currentTok.matches(TokenTypes.KEYWORD, "if")) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                `Expected 'if'`
            ));
        }

        res.registerAdvancement();
        this.advance();

        let condition = res.register(this.expr());
        if(res.error) return res;

        
        if(!this.currentTok.matches(TokenTypes.KEYWORD, "do")) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                `Expected 'do'`
            ));
        }

        res.registerAdvancement();
        this.advance();

        let expr = res.register(this.expr());
        if(res.error) return res;
        cases.push([condition, expr]);

        while(this.currentTok.matches(TokenTypes.KEYWORD, 'elif')) {
            res.registerAdvancement();
            this.advance();

            condition = res.register(this.expr());
            if(res.error) return res;

            if(!this.currentTok.matches(TokenTypes.KEYWORD, "do")) {
                return res.failure(new InvalidSyntaxError(
                    this.currentTok.posStart, this.currentTok.posEnd,
                    `Expected 'do'`
                ));
            }

            res.registerAdvancement();
            this.advance();

            expr = res.register(this.expr());
            if(res.error) return res;
            cases.push([condition, expr]);
        }

        if(this.currentTok.matches(TokenTypes.KEYWORD, "else")) {
            res.registerAdvancement();
            this.advance();

            elseCase = res.register(this.expr());
            if(res.error) return res;
        }

        // if(!this.currentTok.matches(TokenTypes.KEYWORD, "fin")) {
        //     return res.failure(new InvalidSyntaxError(
        //         this.currentTok.posStart, this.currentTok.posEnd,
        //         `Expected 'fin'`
        //     ));
        // }

        return res.success(new IfNode(cases, elseCase));
    }

    forExpr() {
        let res = new ParseResult();

        if(!this.currentTok.matches(TokenTypes.KEYWORD, 'for')) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                `Expected 'for'`
            ));
        }

        res.registerAdvancement();
        this.advance();

        if(this.currentTok.type != TokenTypes.IDENTIFIER) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                `Expected identifier`
            ));
        }

        let varName = this.currentTok;
        res.registerAdvancement();
        this.advance();

        if(this.currentTok.type != TokenTypes.ARROW) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                `Expected '=>`
            ));
        }

        res.registerAdvancement();
        this.advance();

        let startValue = res.register(this.expr());
        if(res.error) return res;

        if(!this.currentTok.matches(TokenTypes.KEYWORD, 'until')) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                `Expected 'until'`
            ));
        }

        res.registerAdvancement();
        this.advance();

        let endValue = res.register(this.expr());
        if(res.error) return res;

        if(this.currentTok.matches(TokenTypes.KEYWORD, 'inc')) {
            res.registerAdvancement();
            this.advance();

            var incValue = res.register(this.expr());
            if(res.error) return res;
        } else {
            incValue = null;
        }

        if(!this.currentTok.matches(TokenTypes.KEYWORD, 'do')) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                `Expected 'do'`
            ));
        }

        res.registerAdvancement();
        this.advance();

        let body = res.register(this.expr());
        if(res.error) return res;

        return res.success(new ForNode(varName, startValue, endValue, incValue, body));
    }

    whileExpr() {
        let res = new ParseResult();

        if(!this.currentTok.matches(TokenTypes.KEYWORD, 'while')) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                `Expected 'while'`
            ));
        }

        res.registerAdvancement();
        this.advance();

        let condition = res.register(this.expr());
        if(res.error) return res;

        if(!this.currentTok.matches(TokenTypes.KEYWORD, 'do')) {
            return res.failure(new InvalidSyntaxError(
                this.currentTok.posStart, this.currentTok.posEnd,
                `Expected 'do'`
            ));
        }

        res.registerAdvancement();
        this.advance();

        let body = res.register(this.expr());
        if(res.error) return res;

        return res.success(new WhileNode(condition, body));
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