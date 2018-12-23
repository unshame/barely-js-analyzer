
export default function renderAnalysis(functions, totalCounts) {
    let html = `<table><tbody>`;


    for (let func of Object.values(functions)) {

        let argsHtml = func.args.length > 0 ? ` takes parameters <strong>${func.args.join(', ')}</strong>` : '';

        html += `
        <tr><td colspan="3">
            <table>
                <caption>
                    Function <strong>${func.name}</strong>${argsHtml}
                </caption>
                <tbody>
                    <table><tbody><tr>
                        <td class="optd">${ renderFuncOps(func.counts.operands, 'Operand', 1) }</td>
                        <td class="optd">${ renderFuncOps(func.counts.operators, 'Operator', 2) }</td>
                        <td class="optd">${ renderFuncOps(func.counts.statements, 'Statement', 3) }</td>
                    </tr></tbody></table>
                </tbody>
        </td></tr>`;
    }
    let {
        operators: [en1, eN1],
        operands: [en2, eN2],
        statements: [en3, eN3]
    } = totalCounts;

    let n = en1 + en2 + en3;
    let N = eN1 + eN2 + eN3;

    html += `
    <tr>
        <td>Σ(n<sub>1</sub>) = ${en1} Σ(N<sub>1</sub>) = ${eN1} </td>
        <td>Σ(n<sub>2</sub>) = ${en2} Σ(N<sub>2</sub>) = ${eN2} </td>
        <td>Σ(n<sub>3</sub>) = ${en3} Σ(N<sub>3</sub>) = ${eN3} </td>
    </tr>
    <tr>
        <td colspan="6"><strong>
            Σ(n) = ${n}<br>
            Σ(N) = ${N}<br>
            V = ${N * Math.log2(n)}
        </strong></td>
    </tr>
    </tbody></table>`;

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

    return html;
}

function escapeHTML(unsafeText) {
    let div = document.createElement('div');
    div.innerText = unsafeText;
    return div.innerHTML;
}
