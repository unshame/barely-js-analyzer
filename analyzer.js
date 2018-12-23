'use strict';

Array.prototype.mapTrim = function() {
    return this.map(str => str.trim());
};

Array.prototype.mapFilterTrim = function () {
    return this.map(str => str.trim()).filter(str => !!str);
};

const statements = [
    'var', 'let', 'const', 'if', 'else', 'break', 'continue',
    'switch', 'throw', 'try', 'catch', 'function', 'return',
    'class', 'do', 'while', 'for', 'in', 'of'
];

const operators = [
    '>>>=',
    '===', '!==', '>>>', '<<=', '>>=',
    '>=', '<=', '==', '%', '++', '--', '&&', '||', '**', '<<', '>>', '=>', '&=', '^=',
    '*=', '/=', '%=', '+=', '-=',
    '+', '-', '=', '*', '/', '!', '<', '>', '&', '|', '^', '(', ')', '.', ',', '~', '?', ':'
];
const joinedEscapedOperators = operators.map(op => escapeRegExp(op)).join('|');
const regExs = {
    functionDeclarations: /function\s+([a-zA-Z_0-9][a-zA-Z0-9]*)\s*\(([^)]*)\)\s*{/g,
    string: /["'`]/g,
    functionCall: /[a-zA-Z_0-9][a-zA-Z0-9]* *\(/g,
    operators: new RegExp(`(${joinedEscapedOperators})`, 'g'),
    operands: /[a-zA-Z_0-9][a-zA-Z0-9]*/g,
    referencedOperands: /@[0-9]+/
};

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

    counts.operators[';'] = lines.length;

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

function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function renderAnalysis(functions) {
    let html = `<table><tbody>`;

    let en1 = 0, en2 = 0, en3 = 0;
    let eN1 = 0, eN2 = 0, eN3 = 0;

    for (let func of Object.values(functions)) {

        let argsHtml = func.args.length > 0 ? ` takes parameters <strong>${func.args.join(', ')}</strong>` : '';

        let [operandHtml, n1, N1] = renderFuncOps(func.counts.operands, 'Operand', 1);
        let [operatorsHtml, n2, N2] = renderFuncOps(func.counts.operators, 'Operator', 2);
        let [statementsHtml, n3, N3] = renderFuncOps(func.counts.statements, 'Statement', 3);
        en1 += n1;
        en2 += n2;
        en3 += n3;
        eN1 += N1;
        eN2 += N2;
        eN3 += N3;

        html += `
        <tr><td colspan="3">
            <table>
                <caption>
                    Function <strong>${ func.name}</strong>${argsHtml}
                </caption>
                <tbody>
                    <table><tbody><tr>
                        <td class="optd">${ operandHtml}</td>
                        <td class="optd">${ operatorsHtml}</td>
                        <td class="optd">${ statementsHtml}</td>
                    </tr></tbody></table>
                </tbody>
        </td></tr>`;
    }

    html += `
    </tbody><tfoor>
        <th align="left">Σ(n<sub>1</sub>) = ${en1} Σ(N<sub>1</sub>) = ${eN1} </th>
        <th align="left">Σ(n<sub>2</sub>) = ${en2} Σ(N<sub>2</sub>) = ${eN2} </th>
        <th align="left">Σ(n<sub>3</sub>) = ${en3} Σ(N<sub>3</sub>) = ${eN3} </th>
    </tfoot></table>`;

    return html;
}

function renderFuncOps(ops, title, i) {
    let html = `<table class="ops"><thead><tr><th>${title}</th><th>Count</th><tbody>`;

    let entries = Object.entries(ops);
    let n = 0, N = 0;

    if (entries.length === 0) {

        html += `<tr><td colspan="2" align="center">None</td></tr></tbody>`;
    }
    else {
        for (let [key, value] of entries) {
            html += `<tr><td>${escapeHTML(key)}</td><td align="center">${value}</td></tr>`;
            n++;
            N += value;
        }
        html += `</tbody><tfoor><th>n<sub>${i}</sub> = ${n}</th><th>N<sub>${i}</sub> = ${N}</th></tfoot>`;
    }


    html += `</table>`;

    return [html, n, N];
}

function escapeHTML(unsafeText) {
    let div = document.createElement('div');
    div.innerText = unsafeText;
    return div.innerHTML;
}
