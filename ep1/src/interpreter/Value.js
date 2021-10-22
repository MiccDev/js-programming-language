const { RTError } = require('../errors/index');
const Position = require('../lexer/Position');
const Context = require('./Context');

module.exports = class Value {
    constructor() {
        this.setPos();
        this.setContext();

        this.name = "Value";
    }

    /**
     * @param {Position} posStart 
     * @param {Position} posEnd 
     * @returns {Value}
     */
    setPos(posStart, posEnd) {
        this.posStart = posStart;
        this.posEnd = posEnd;
        return this;
    }

    addedTo(other) {
        return this.illegalOperation(other)
    }

    subbedBy(other) {
        return this.illegalOperation(other)
    }

    multedBy(other) {
        return this.illegalOperation(other)
    }

    divedBy(other) {
        return this.illegalOperation(other)
    }

    /**
     * @param {Context} context 
     * @returns {Value}
     */
    setContext(context) {
        this.context = context;
        return this;
    }

    copy() {
        throw new Error('No copy method defined')
    }

    illegalOperation(self, other=null) {
        if(!other) other = self;
        return new RTError(
            self.posStart, other.posEnd,
            'Illegal operation',
            self.context
        )
    }
}