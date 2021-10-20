const { RTError } = require("../errors");
const Value = require("./Value");

module.exports = class Number extends Value {
    /**
     * @param {number} value 
     */
    constructor(value) {
        super();
        this.setPos();
        this.setContext();
        this.value = value;

        this.name = "Number";
    }

    setPos(posStart, posEnd) {
        this.posStart = posStart;
        this.posEnd = posEnd;
        return this;
    }

    addedTo(other) {
        if(other.name == "Number") {
            return new Number(this.value + other.value).setContext(this.context)
        } else {
            return this.illegalOperation(this, other);
        }
    }

    subbedBy(other) {
        if(other.name == "Number") {
            return new Number(this.value - other.value).setContext(this.context)
        } else {
            return this.illegalOperation(this, other);
        }
    }

    multedBy(other) {
        if(other.name == "Number") {
            return new Number(this.value * other.value).setContext(this.context)
        } else {
            return this.illegalOperation(this, other);
        }
    }

    divedBy(other) {
        if(other.name == "Number") {
            if(other.value == 0) {
                return {
                    result: null,
                    error: new RTError(
                        other.posStart, other.posEnd,
                        'Division by zero',
                        this.context
                    )
                };
            }
            return { result: new Number(this.value / other.value).setContext(this.context), error: null };
        } else {
            return this.illegalOperation(this, other);
        }
    }

    toString() {
        return this.value.toString();
    }
}