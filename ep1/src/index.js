const Context = require('./interpreter/Context');
const Lexer = require('./lexer/Lexer');
const Parser = require('./parser/Parser');
const Interpreter = require('./interpreter/Interpreter');

const prompt = require('prompt-sync')({
    sigint: true
});

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
    let result = interpreter.visit(ast.node, context);

    if(result.error) return result.value.asError();
    console.log(result.value.toString());
}

while(true) {
    let data = prompt("uniform > ");
    run("<stdin>", data);
}