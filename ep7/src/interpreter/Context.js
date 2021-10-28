const Position = require("../lexer/Position");

module.exports = class Context {
    /**
     * @param {string} displayName 
     * @param {Context} parent 
     * @param {Position} parentEntryPos 
     */
    constructor(displayName, parent=null, parentEntryPos=null) {
        this.displayName = displayName;
        this.parent = parent;
        this.parentEntryPos = parentEntryPos;
        this.symbolTable = null;
    }
}