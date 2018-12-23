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
    '+', '-', '=', '*', '/', '!', '<', '>', '&', '|', '^', '(', ')', '.', ',', '~', '?', ':'
];

const joinedEscapedOperators = operators.map(op => escapeRegExp(op)).join('|');

export const regExs = {
    functionDeclarations: /function\s+([a-zA-Z_0-9][a-zA-Z0-9]*)\s*\(([^)]*)\)\s*{/g,
    string: /["'`]/g,
    functionCall: /[a-zA-Z_0-9][a-zA-Z0-9]* *\(/g,
    operators: new RegExp(`(${joinedEscapedOperators})`, 'g'),
    operands: /[a-zA-Z_0-9][a-zA-Z0-9]*/g,
    referencedOperands: /@[0-9]+/
};

function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
