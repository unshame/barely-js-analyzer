
export default function renderAnalysis(functions) {
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
