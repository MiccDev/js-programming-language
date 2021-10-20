const Position = require('./lexer/Position');

/** 
 * @param {String} text 
 * @param {Position} posStart 
 * @param {Position} posEnd 
 */
 function stringWithArrows(text, posStart, posEnd) {
    var result = '';

    var idxStart = Math.max(text.lastIndexOf('\n', posStart.idx), 0);
    var idxEnd = text.indexOf('\n', idxStart + 1)
    if(idxEnd < 0) idxEnd = text.length;

    var lineCount = posEnd.ln - posStart.ln + 1
    for(var i = 0; i < lineCount; i++) {
        var line = text.substring(idxStart, idxEnd);
        var colStart;
        if(i == 0) colStart = posStart.col
        else colStart = 0;
        var colEnd;
        if(i == lineCount - 1) colEnd = posEnd.col
        else colEnd = line.length - 1;
        
        result += line + '\n';
        result += " ".repeat(colStart)
        result += "^".repeat((colEnd - colStart))

        idxStart = idxEnd;
        idxEnd = text.indexOf('\n', idxStart + 1)
        if(idxEnd < 0) idxEnd = text.length;
    }

    return result;
}
module.exports.stringWithArrows = stringWithArrows;

function getattr(obj, prop, defaultValue=null) {
    if(prop in obj) {
        let val = obj[prop];
        if(typeof val === 'function')
            return val.bind(obj);
        return val;
    }

    if(arguments.length > 2) {
        return defaultValue;
    }

    throw new TypeError(`"${obj}" object has no attribute "${prop}"`);
}
module.exports.getattr = getattr;