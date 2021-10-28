const Value = require("src/interpreter/Value");
const Number = require('src/interpreter/Number');

module.exports = class String extends Value {
    /**
     * @param {string} value 
     */
    constructor(value) {
        super();
        this.value = value;

        this.name = "String";
    }

    addedTo(other) {
        if(other.name == "String") {
            return new String(this.value + other.value).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonEq(other) {
        if(other.name == "String") {
            return this.value == other.value ? Number.true : Number.false;
        } else {
            return Number.false;
        }
    }

    getComparisonNe(other) {
        if(other.name == "String") {
            return this.value != other.value ? Number.true : Number.false;
        } else {
            return Number.false;
        }
    }

    oredBy(other) {
        return this.value || other.value ? Number.true : Number.false;
    }

    andedBy(other) {
        return this.value && other.value ? Number.true : Number.false;
    }

    isTrue() {
        return this.value.length > 0;
    }

    copy() {
        let copy = new String(this.value);
        copy.setContext(this.context);
        copy.setPos(this.posStart, this.posEnd);
        return copy;
    }

    toString() {
        return `"${this.value}"`;
    }

    logging() {
        return `${this.value}`;
    }
}