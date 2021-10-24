const { RTError } = require("../errors");
const Value = require("./Value");
const RTResult = require("./RTResult");
const Interpreter = require("./Interpreter");
const Context = require("./Context");
const SymbolTable = require('./SymbolTable');

module.exports = class Function extends Value {
    /**
     * 
     * @param {string} name 
     * @param {Node} bodyNode 
     * @param {Node[]} argNames 
     */
    constructor(name, bodyNode, argNames) {
        super();

        this.name = name || "<anounymous>";
        this.bodyNode = bodyNode;
        this.argNames = argNames;

        this.name = "Function";
    }

    execute(interpreter, args) {
        let res = new RTResult();
        let newContext = new Context(this.name, this.context, this.posStart);
        newContext.symbolTable = new SymbolTable(newContext.parent.symbolTable);

        if(args.length > this.argNames.length) {
            return res.failure(new RTError(
                this.posStart, this.posEnd,
                `${args.length - this.argNames.length} too many args passed into '${this.name}'`,
                this.context
            ));
        }

        if(args.length < this.argNames.length) {
            return res.failure(new RTError(
                this.posStart, this.posEnd,
                `${args.length - this.argNames.length} too few args passed into '${this.name}'`,
                this.context
            ));
        }

        for(let i = 0; i < args.length; i++) {
            let argName = this.argNames[i];
            let argValue = args[i];
            argValue.setContext(newContext);
            newContext.symbolTable.set(argName, argValue);
        }

        let value = res.register(interpreter.visit(this.bodyNode, newContext));
        if(res.error) return res;
        return res.success(value);
    }

    copy() {
        let copy = new Function(this.name, this.bodyNode, this.argNames);
        copy.setContext(this.context);
        copy.setPos(this.posStart, this.posEnd);
        return copy;
    }

    toString() {
        return `<function ${this.name}>`;
    }
}