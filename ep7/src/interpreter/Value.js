const { RTError } = require('src/errors');
const Position = require('src/lexer/Position');
const Context = require('src/interpreter/Context');

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

    powedBy(other) {
        return this.illegalOperation(other);
    }

    getComparisonEq(other) {
        return this.illegalOperation(other);
    }

    getComparisonNe(other) {
        return this.illegalOperation(other);
    }

    getComparisonLt(other) {
        return this.illegalOperation(other);
    }

    getComparisonGt(other) {
        return this.illegalOperation(other);
    }

    getComparisonLte(other) {
        return this.illegalOperation(other);
    }

    getComparisonGte(other) {
        return this.illegalOperation(other);
    }

    andedBy(other) {
        return this.illegalOperation(other);
    }

    oredBy(other) {
        return this.illegalOperation(other);
    }

    notted() {
        throw new Error('No notted method defined')
    }

    isTrue() {
        throw new Error('No isTrue method defined')
    }

    /**
     * @param {Context} context 
     * @returns {Value}
     */
    setContext(context=null) {
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

    boolToNum(boolean) {
        return boolean ? 1 : 0;
    }
    
}