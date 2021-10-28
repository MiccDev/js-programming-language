const { UniformError } = require('src/errors');
const Node = require('src/parser/nodes/Node');

module.exports = class ParseResult {
    constructor() {
        /**
         * @type {UniformError}
         */
        this.error = null;
        /**
         * @type {Node}
         */
        this.node = null;
        this.lastRegisteredAdvanceCount = 0;
        this.advanceCount = 0;
        this.toReverseCount = 0;
    }

    registerAdvancement() {
        this.lastRegisteredAdvanceCount = 1;
        this.advanceCount++;
    }

    /**
     * @param {ParseResult} res 
     * @returns {Node}
     */
    register(res) {
        this.lastRegisteredAdvanceCount = res.advanceCount;
        this.advanceCount += res.advanceCount;
        if(res.error) this.error = res.error;
        return res.node;
    }

    /**
     * @param {ParseResult} res 
     * @returns {Node}
     */
    tryRegister(res) {
        if(res.error) {
            this.toReverseCount = res.advanceCount;
            return null;
        }
        return this.register(res);
    }

    /**
     * @param {Node} node 
     * @returns {ParseResult}
     */
    success(node) {
        this.node = node;
        return this;
    }

    /**
     * @param {UniformError} error 
     * @returns {ParseResult}
     */
    failure(error) {
        if(!this.error || this.advanceCount == 0) {
            this.error = error;
        }
        return this;
    }

}