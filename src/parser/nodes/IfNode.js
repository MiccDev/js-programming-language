const Node = require("./Node");

module.exports = class IfNode extends Node {
    /**
     * @param {Array<Array<Node>>} cases
     * @param {Node} elseCase
     */
    constructor(cases, elseCase) {
        super();
        this.cases = cases;
        this.elseCase = elseCase;

        this.posStart = this.cases[0][0].posStart;
        this.posEnd = (this.elseCase || this.cases[this.cases.length - 1][0]).posEnd;

        this.name = "IfNode";
    }
}