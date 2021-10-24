const Context = require('./interpreter/Context');
const Lexer = require('./lexer/Lexer');
const Parser = require('./parser/Parser');
const Interpreter = require('./interpreter/Interpreter');
const SymbolTable = require('./interpreter/SymbolTable');
const Number = require('./interpreter/Number');

const prompt = require('prompt-sync')({
    sigint: true
});

var globalSymbolTable = new SymbolTable();
globalSymbolTable.set("null", new Number(0));
globalSymbolTable.set("pi", new Number(3.14159));
globalSymbolTable.set("true", new Number(1));
globalSymbolTable.set("false", new Number(0));

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
    if(result.value) console.log(result.value.toString());
}

while(true) {
    let data = prompt("uniform > ");
    run("<stdin>", data);
}

// function runFile(fn) {
//     run("test", fs.readFileSync(fn, { encoding: "utf-8" }));
// }

// runFile("test/lang.uni");