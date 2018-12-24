import { statements, regExs } from './consts.js';

export default function analyze(code) {
    const [functions, referencedValues] = getFunctionObjects(code);
    return [functions, referencedValues, getTotalOpCounts(functions)];
}

function getFunctionObjects(code) {
    const functions = {};
    const referencedValues = [];
    code = code.replace(regExs.comments, '');
    code = getSafeCode(code, referencedValues);

    while (true) {

        let funcMatch = regExs.functionDeclarations.exec(code);
        if (!funcMatch) {
            break;
        }

        let [ , name, args] = funcMatch.mapTrim();
        args = args.split(',').mapFilterTrim();
        let startIndex = funcMatch.index + funcMatch[0].length;
        let body = getTextBetween(code, '{', '}', startIndex, 1)[0].trim();

        let lines = body.split(';').mapFilterTrim();
        let counts = getOpCounts(lines, referencedValues);

        let func = {
            args, name, body,
            body, lines,
            counts
        };

        functions[name] = func;
    }

    return [functions, referencedValues];
}

function getTextBetween(code, openChar, closeChar, startIndex, depth = 0) {
    let endIndex = code.length - startIndex;

    for (let i = startIndex; i < code.length; i++) {
        let char = code[i];

        if (char == closeChar) {
            depth--;

            if (depth == 0) {
                endIndex = i;
                break;
            }
        }

        if (char == openChar) {
            depth++;
            continue;
        }
    }

    return [code.substr(startIndex, endIndex - startIndex), endIndex];
}

function getSafeCode(code, referencedValues) {

    while (true) {

        let match = regExs.string.exec(code);
        if (!match) {
            break;
        }

        let char = match[0][0];
        let startIndex = match.index + 1;
        let [value, endIndex] = getTextBetween(code, char, char, startIndex, 1);

        if(code[endIndex] != char) {
            console.error(code);
            throw new Error('String literal not closed');
        }

        referencedValues.push(value);
        code = code.substring(0, startIndex - 1) + `@${ referencedValues.length - 1 }` + code.substring(endIndex + 1);
    }

    return code;
}

function getOpCounts(lines, referencedValues) {

    let counts = {
        operators: {},
        operands: {},
        statements: {}
    };

    for (let line of lines) {

        updateOpCounter(counts.operators, '()', (line.match(regExs.functionCall) || []).length);
        for (let operator of (line.match(regExs.operators) || [])) {
            updateOpCounter(counts.operators, operator);
        };

        for (let operand of (line.match(regExs.operands) || [])) {

            if(operand[0] == '@') {
                continue;
            }

            updateOpCounter(statements.includes(operand) ? counts.statements : counts.operands, operand);
        };

        for (let operand of (line.match(regExs.referencedOperands) || [])) {
            let i = parseInt(operand.substr(1), 10);
            let value = referencedValues[i].substr(0, 30);

            if (value.length + 2 < referencedValues[i].length) {
                value += '...';
            }

            updateOpCounter(counts.operands, `'${value.replace(/[\n\r]/g, '')}'`);
        }
    }

    updateOpCounter(counts.operators, '(', -counts.operators['()'] || 0);
    updateOpCounter(counts.operators, ')', -counts.operators['()'] || 0);

    updateOpCounter(counts.operators, ';', lines.length);

    return counts;
}

function getTotalOpCounts(functions) {

    let counts = {
        operators: {},
        operands: {},
        statements: {}
    };

    for (let func of Object.values(functions)) {

        for (let [type, count] of Object.entries(func.counts)) {

            for (let [op, amount] of Object.entries(count)) {
                updateOpCounter(counts[type], op, amount);
            }
        }
    }

    let totalCounts = {};

    for (let [type, count] of Object.entries(counts)) {
        totalCounts[type] = Object.values(count).reduce(([n, N], amount) => [n + 1, N + amount], [0, 0]);
    }

    return totalCounts;
}

function updateOpCounter(op, o, delta = 1) {
    if (!Object.prototype.hasOwnProperty.call(op, o)) {
        op[o] = 0;
    }

    op[o] += delta;

    if (op[o] === 0) {
        delete op[o];
    }
}

Array.prototype.mapTrim = function () {
    return this.map(str => str.trim());
};

Array.prototype.mapFilterTrim = function () {
    return this.map(str => str.trim()).filter(str => !!str);
};
