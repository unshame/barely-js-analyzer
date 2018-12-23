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
    functionDeclarations: /function\s+([a-zA-Z_0-9][a-zA-Z0-9]*)\s*\(([^)]*)\)\s*{([^}]*)}/g,
    string: /["'`]([^"'`\n\r]*)[\"\'\`]/g,
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

        let [ , name, args, body] = funcMatch.mapTrim();
        args = args.split(',').mapFilterTrim();

        let lines = body.split(';').mapFilterTrim();
        let [safeLines, referencedValues] = getSafeLines(lines);
        let counts = countOps(lines, referencedValues);

        let func = {
            args, name, body, lines,
            safeLines, referencedValues,
            counts
        };

        functions[name] = func;
    }

    return functions;
}


function getSafeLines(lines) {
    let referencedValues = [];
    let safeLines = lines.map(line => line.replace(
        regExs.string,
        (match, strValue) => {
            referencedValues.push(strValue);
            return `@${referencedValues.length - 1}`;
        }
    ));

    return [safeLines, referencedValues];
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
            updateOpCounter(counts.operands, `'${referencedValues[i]}'`);
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
                        <td>${ operandHtml}</td>
                        <td>${ operatorsHtml}</td>
                        <td>${ statementsHtml}</td>
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
            html += `<tr><td>${key}</td><td align="center">${value}</td></tr>`;
            n++;
            N += value;
        }
        html += `</tbody><tfoor><th>n<sub>${i}</sub> = ${n}</th><th>N<sub>${i}</sub> = ${N}</th></tfoot>`;
    }


    html += `</table>`;

    return [html, n, N];
}
