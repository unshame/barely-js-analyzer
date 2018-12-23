'use strict';

import renderAnalysis from './renderer.js';
import { statements, regExs } from './consts.js';

export default function analyze(code) {
    const functions = getFunctionObjects(code);
    console.log(functions);
    return renderAnalysis(functions);
}

function getFunctionObjects(code) {
    const functions = {};
    while (true) {

        let funcMatch = regExs.functionDeclarations.exec(code);
        if (!funcMatch) {
            break;
        }

        let [ , name, args] = funcMatch.mapTrim();
        let startIndex = funcMatch.index + funcMatch[0].length;
        let body = getTextBetween(code, '{', '}', startIndex, 1)[0].trim();
        let [safeBody, referencedValues] = getSafeCode(body);
        args = args.split(',').mapFilterTrim();

        let lines = safeBody.split(';').mapFilterTrim();
        let counts = countOps(lines, referencedValues);

        let func = {
            args, name, body,
            safeBody, lines, referencedValues,
            counts
        };

        functions[name] = func;
    }

    return functions;
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


function getSafeCode(code) {
    let referencedValues = [];

    let matches = code.match(regExs.string);

    if (matches && (matches.length) % 2 !== 0) {
        throw new Error('Comment not closed');
    }

    while (true) {

        let match = regExs.string.exec(code);
        if (!match) {
            break;
        }

        let char = match[0][0];
        let startIndex = match.index + 1;
        let [value, endIndex] = getTextBetween(code, char, char, startIndex, 1);
        referencedValues.push(value);
        code = code.substring(0, startIndex - 1) + `@${ referencedValues.length - 1 }` + code.substring(endIndex + 1);
    }

    return [code, referencedValues];
}

function countOps(lines, referencedValues) {

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

function updateOpCounter(op, o, delta = 1) {
    if(!op[o]) {
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
