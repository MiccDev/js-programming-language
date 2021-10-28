const RTResult = require("./RTResult");
const BaseFunction = require("./BaseFunction");

module.exports = class Function extends BaseFunction {
    /**
     * 
     * @param {string} funcName 
     * @param {Node} bodyNode 
     * @param {Node[]} argNames 
     */
    constructor(funcName, bodyNode, argNames) {
        super(funcName);
        this.bodyNode = bodyNode;
        this.argNames = argNames;

        this.name = "Function";
    }

    execute(interpreter, args) {
        let res = new RTResult();
        let execCtx = this.generateNewContext();

        res.register(this.checkAndPopulateArgs(this.argNames, args, execCtx));
        if(res.error) return res;

        let value = res.register(interpreter.visit(this.bodyNode, execCtx));
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