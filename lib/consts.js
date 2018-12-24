export const statements = [
    'var', 'let', 'const', 'if', 'else', 'break', 'continue',
    'switch', 'throw', 'try', 'catch', 'function', 'return',
    'class', 'do', 'while', 'for', 'in', 'of'
];

export const operators = [
    '>>>=',
    '===', '!==', '>>>', '<<=', '>>=',
    '>=', '<=', '==', '%', '++', '--', '&&', '||', '**', '<<', '>>', '=>', '&=', '^=',
    '*=', '/=', '%=', '+=', '-=',
    '+', '-', '=', '*', '/', '!', '<', '>', '&', '|', '^', '(', ')', '.', ',', '~', '?', ':', '[', ']'
];

const joinedEscapedOperators = operators.map(op => escapeRegExp(op)).join('|');

const lineComment = /(?:^|\s)\/\/(.+?)$/gm;
const blockComment = /\/\*([\S\s]*?)\*\//gm;

export const regExs = {
    functionDeclarations: /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*{/g,
    string: /["'`]/g,
    functionCall: /[a-zA-Z_][a-zA-Z0-9_]* *\(/g,
    operators: new RegExp(`(${joinedEscapedOperators})`, 'g'),
    operands: /@*[a-zA-Z0-9_]+/g,
    referencedOperands: /@[0-9]+/,
    comments: new RegExp(`(?:${lineComment.source})|(?:${blockComment.source})`, 'gm')
};

function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
