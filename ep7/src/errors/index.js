const Position = require('../lexer/Position');
const Context = require('../interpreter/Context');
const { stringWithArrows } = require('../utils');

module.exports.UniformError = class UniformError {
    /**
     * @param {Position} posStart 
     * @param {Position} posEnd 
     * @param {string} errorName 
     * @param {string} details
     */
    constructor(posStart, posEnd, errorName, details) {
        this.posStart = posStart;
        this.posEnd = posEnd;
        this.errorName = errorName;
        this.details = details;
    }

    asError() {
        let result = `${this.errorName}: ${this.details}\n`;
        result += `File ${this.posStart.fn}, line ${this.posStart.ln + 1}`;
        result += `\n\n${stringWithArrows(this.posStart.ftxt, this.posStart, this.posEnd)}`;
        console.log(result);
    }
}

module.exports.IllegalCharError = class IllegalCharError extends module.exports.UniformError {
    /**
     * @param {Position} posStart 
     * @param {Position} posEnd 
     * @param {string} details
     */
    constructor(posStart, posEnd, details) {
        super(posStart, posEnd, "Illegal Character", details);
    }
}

module.exports.ExpectedCharError = class ExpectedCharError extends module.exports.UniformError {
    /**
     * @param {Position} posStart 
     * @param {Position} posEnd 
     * @param {string} details
     * @param {Context} context
     */
    constructor(posStart, posEnd, details) {
        super(posStart, posEnd, "Expected Character", details);
    }
}

module.exports.InvalidSyntaxError = class InvalidSyntaxError extends module.exports.UniformError {
    /**
     * @param {Position} posStart 
     * @param {Position} posEnd 
     * @param {string} details
     */
    constructor(posStart, posEnd, details) {
        super(posStart, posEnd, "Invalid Syntax", details);
    }
}

module.exports.RTError = class RTError extends module.exports.UniformError {
    /**
     * @param {Position} posStart 
     * @param {Position} posEnd 
     * @param {string} details
     * @param {Context} context
     */
    constructor(posStart, posEnd, details, context) {
        super(posStart, posEnd, "Runtime Error", details);
        this.context = context;
    }

    asError() {
        let result = this.generateTraceback();
        result += `${this.errorName}: ${this.details}`
        result += `\n\n${stringWithArrows(this.posStart.ftxt, this.posStart, this.posEnd)}`;
        console.log(result);
    }

    generateTraceback() {
        let result = "";
        let pos = this.posStart;
        let ctx = this.context;

        while(ctx) {
            result = `  File ${pos.ln}, line ${pos.ln + 1}, in ${ctx.displayName}\n${result}`;
            pos = ctx.parentEntryPos;
            ctx = ctx.parent;
        }

        return `Traceback (most recent call last):\n` + result;
    }
}