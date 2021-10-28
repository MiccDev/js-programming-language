const { RTError } = require("src/errors");
const Value = require("src/interpreter/Value");
const RTResult = require("src/interpreter/RTResult");
const Interpreter = require("src/interpreter/Interpreter");
const Context = require("src/interpreter/Context");
const SymbolTable = require('src/interpreter/SymbolTable');

module.exports = class BaseFunction extends Value {
    /**
     * @param {string} funcName 
     */
    constructor(funcName) {
        super();
        this.funcName = funcName || "<anounymous>";
        
        this.name = "BaseFunction";
    }

    generateNewContext() {
        let newContext = new Context(this.funcName, this.context, this.posStart);
        newContext.symbolTable = new SymbolTable(newContext.parent.symbolTable);
        return newContext;
    }

    checkArgs(argNames, args) {
        let res = new RTResult();

        if(args) {
            if(args.length > argNames.length) {
                return res.failure(new RTError(
                    this.posStart, this.posEnd,
                    `${args.length - argNames.length} too many args passed into '${this.funcName}'`,
                    this.context
                ));
            }
    
            if(args.length < argNames.length) {
                return res.failure(new RTError(
                    this.posStart, this.posEnd,
                    `${args.length - argNames.length} too few args passed into '${this.funcName}'`,
                    this.context
                ));
            }
    
        }

        return res.success(null);
    }

    populateArgs(argNames, args, execCtx) {
        if(args) {
            for(let i = 0; i < args.length; i++) {
                let argName = argNames[i];
                let argValue = args[i];
                argValue.setContext(execCtx);
                execCtx.symbolTable.set(argName, argValue);
            }
        }
    }

    checkAndPopulateArgs(argNames, args, execCtx) {
        let res = new RTResult();
        res.register(this.checkArgs(argNames, args));
        if(res.error) return res;
        this.populateArgs(argNames, args, execCtx);
        return res.success(null);
    }
}