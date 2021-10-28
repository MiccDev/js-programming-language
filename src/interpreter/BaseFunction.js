const { RTError } = require("../errors");
const Value = require("./Value");
const RTResult = require("./RTResult");
const Interpreter = require("./Interpreter");
const Context = require("./Context");
const SymbolTable = require('./SymbolTable');

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