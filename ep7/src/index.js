const Context = require('./interpreter/Context');
const Lexer = require('./lexer/Lexer');
const Parser = require('./parser/Parser');
const Interpreter = require('./interpreter/Interpreter');
const SymbolTable = require('./interpreter/SymbolTable');
const Number = require('./interpreter/Number');
const BuiltInFunction = require('./interpreter/BuiltInFunction');

const prompt = require('prompt-sync')({
    sigint: true
});

const fs = require('fs');

var globalSymbolTable = new SymbolTable();
globalSymbolTable.set("null", Number.null);
globalSymbolTable.set("pi", Number.pi);
globalSymbolTable.set("true", Number.true);
globalSymbolTable.set("false", Number.false);

globalSymbolTable.set("print", BuiltInFunction.print);
globalSymbolTable.set("capture", BuiltInFunction.capture);
globalSymbolTable.set("round", BuiltInFunction.round);
globalSymbolTable.set("random", BuiltInFunction.random);

/**
 * @param {string} fn 
 * @param {string} data 
 */
function run(fn, data) {
    if(data.trim() == "") return;

    let lexer = new Lexer(fn, data);
    let { error, tokens } = lexer.makeTokens();
    if(error) return error.asError();

    let parser = new Parser(tokens);
    let ast = parser.parse();
    if(ast.error) return ast.error.asError();

    let interpreter = new Interpreter();
    let context = new Context("<program>");
    context.symbolTable = globalSymbolTable;
    let result = interpreter.visit(ast.node, context);

    if(result.error) return result.error.asError();
    // if(result.value) console.log(result.value.toString());
}

// while(true) {
//     let data = prompt("uniform > ");
//     run("<stdin>", data);
// }

function runFile(fn) {
    run("lang", fs.readFileSync(fn, { encoding: "utf-8" }));
}

runFile("test/uniform.uni");