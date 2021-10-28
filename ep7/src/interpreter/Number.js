const { RTError } = require("src/errors");
const Value = require("src/interpreter/Value");

module.exports = class Number extends Value {

    static null = new Number(0);
    static false = new Number(0);
    static true = new Number(1);
    static pi = new Number(Math.PI);

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

    powedBy(other) {
        if(other.name == "Number") {
            return new Number(this.value ** other.value).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonEq(other) {
        if(other.name == "Number") {
            return new Number(+(this.value == other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonNe(other) {
        if(other.name == "Number") {
            return new Number(+(this.value != other.value)).setContext(this.context);
        } else {
            return Number.false;
        }
    }

    getComparisonLt(other) {
        if(other.name == "Number") {
            return new Number(+(this.value < other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonGt(other) {
        if(other.name == "Number") {
            return new Number(+(this.value > other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonLte(other) {
        if(other.name == "Number") {
            return new Number(+(this.value <= other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonGte(other) {
        if(other.name == "Number") {
            return new Number(+(this.value >= other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    andedBy(other) {
        if(other.name == "Number") {
            return new Number(+(this.value && other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    oredBy(other) {
        if(other.name == "Number") {
            return new Number(+(this.value || other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    notted() {
        return new Number(this.value == 0 ? 1 : 0).setContext(this.context);
    }

    isTrue() {
        return this.value != 0;
    }

    copy() {
        let copy = new Number(this.value);
        copy.setPos(this.posStart, this.posEnd);
        copy.setContext(this.context);
        return copy;
    }

    toString() {
        return this.value.toString();
    }

    logging() {
        return this.value.toString();
    }
}