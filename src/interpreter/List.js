const Value = require('./Value');

module.exports = class List extends Value {
    /**
     * @param {[]} elements
     */
    constructor(elements) {
        super();
        this.elements = elements;

        this.name = "List";
    }

    copy() {
        let copy = new List(this.elements);
        copy.setPos(this.posStart, this.posEnd);
        copy.setContext(this.context);
        return copy;
    }

    toString() {
        let n = [];
        this.elements.forEach(x => {
            n.push(x.toString());
        });
        return `[${n.join(", ")}]`;
    }

    logging() {
        let n = [];
        this.elements.forEach(x => {
            n.push(x.toString());
        });
        return `[${n.join(", ")}]`;
    }
}