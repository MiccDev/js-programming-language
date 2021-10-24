const { RTError } = require("../errors");
const Value = require("./Value");
const RTResult = require("./RTResult");
const Interpreter = require("./Interpreter");
const Context = require("./Context");
const SymbolTable = require('./SymbolTable');

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
}