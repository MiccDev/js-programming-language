const prompt = require('prompt-sync')({
    sigint: true
});

const RTResult = require("./RTResult");
const BaseFunction = require("./BaseFunction");
const { getattr } = require("../utils");
const Context = require("./Context");
const Number = require('./Number');
const String = require("./String");

module.exports = class BuiltInFunction extends BaseFunction {

    static print = new BuiltInFunction("print");

    static capture = new BuiltInFunction("capture");

    static random = new BuiltInFunction("random");

    static round = new BuiltInFunction("round");

    /**
     * @param {string} funcName 
     */
    constructor(funcName) {
        super(funcName);

        this.printArgs = [ "data" ];
        this.captureArgs = [ "data" ];
        this.randomArgs = [];
        this.roundArgs = [ "val" ];
    }

    execute(interpreter, args) {
        let res = new RTResult();
        let execCtx = this.generateNewContext();

        let methodName = `execute_${this.funcName}`;
        let methodArgs = `${this.funcName}Args`;
        let method = getattr(this, methodName, this.noVisitMethod);

        res.register(this.checkAndPopulateArgs(this[methodArgs], args, execCtx));
        if(res.error) return res;

        let returnValue = res.register(method(execCtx));
        if(res.error) return res;
        return res.success(returnValue);
    }

    noVisitMethod(node, context) {
        throw new Error(`No execute_${this.funcName} method defined`);
    }

    copy() {
        let copy = new BuiltInFunction(this.funcName);
        copy.setContext(this.context);
        copy.setPos(this.posStart, this.posEnd);
        return copy;
    }

    toString() {
        return `<built-in function ${this.funcName}>`;
    }

    // ###################################################################

    /**
     * @param {Context} execCtx 
     */
    execute_print(execCtx) {
        console.log(execCtx.symbolTable.get("data").logging());
        return new RTResult().success(Number.null);
    }

    /**
     * @param {Context} execCtx 
     */
    execute_capture(execCtx) {
        let returnValue = prompt(execCtx.symbolTable.get("data").logging());
        return new RTResult().success(new String(returnValue));
    }

    /**
     * @param {Context} execCtx 
     */
    execute_random(execCtx) {
        return new RTResult().success(new Number(Math.random()));
    }

    /**
     * @param {Context} execCtx 
     */
    execute_round(execCtx) {
        return new RTResult().success(new Number(Math.round(execCtx.symbolTable.get("val"))));
    }
}