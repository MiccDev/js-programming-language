module.exports = class Position {
    /**
     * @param {number} idx 
     * @param {number} ln 
     * @param {number} col 
     * @param {string} fn 
     * @param {string} ftxt 
     */
    constructor(idx, ln, col, fn, ftxt) {
        this.idx = idx;
        this.ln = ln;
        this.col = col;
        this.fn = fn;
        this.ftxt = ftxt;
    }

    /**
     * 
     * @param {string} currentChar 
     * @returns {Position}
     */
    advance(currentChar) {
        this.idx++;
        this.col++;

        if(currentChar == '\n') {
            this.ln++;
            this.col = 0;
        }

        return this;
    }

    /**
     *  @returns {Position}
     */
    copy() {
        return new Position(this.idx, this.ln, this.col, this.fn, this.ftxt);
    }

}