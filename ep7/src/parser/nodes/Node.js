const Position = require("src/lexer/Position");

module.exports = class Node {
    /**
     * @type {Position}
     */
    posStart = null;
    /**
     * @type {Position}
     */
    posEnd = null;
    name = "";
}