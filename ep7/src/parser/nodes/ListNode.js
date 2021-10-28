const Position = require('../../lexer/Position');
const Node = require('./Node');

module.exports = class ListNode extends Node {
    /**
     * @param {Node[]} elementNodes 
     * @param {Position} posStart
     * @param {Position} posEnd 
     */
    constructor(elementNodes, posStart, posEnd) {
        super();
        this.elementNodes = elementNodes;

        this.posStart = posStart;
        this.posEnd = posEnd;

        this.name = "ListNode";
    }

}