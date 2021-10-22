module.exports = class SymbolTable {
    constructor() {
        this.symbols = {};
        this.parent = null;
    }

    get(name) {
        let value = this.symbols[name];
        if(value == null && this.parent) {
            return this.parent.get(name);
        }
        return value;
    }

    set(name, value) {
        this.symbols[name] = value;
    }

    remove(name) {
        delete this.symbols[name];
    }
}