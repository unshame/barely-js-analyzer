import analyzeCode from './lib/analyzer.js';
import renderAnalysis from './lib/renderer.js';

const inputCode = $('#code');
const inputMain = $('#main');
const buttonRun = $('#run');
const buttonAnalyze = $('#analyze');
const analysis = $('#analysis');

loadSampleCode();

buttonRun.click(() => runCode());
buttonAnalyze.click(() => render());
inputCode.on('keyup', () => render());

function loadSampleCode() {
    $.ajax('./sample.js', {
        dataType: 'text'
    }).done((data) => {
        inputCode.html(data);
        render();
    });
}

function runCode() {
    const funcText = `(function() { ${inputCode.val()}; ${inputMain.val()}})()`;
    try {
        eval(funcText);
    }
    catch(e) {
        console.error(e);
    }
}

function render() {
    try {
        let [functions, referencedValues, totalCounts] = analyzeCode(inputCode.val());
        console.log(functions);
        console.log(referencedValues);
        console.log(totalCounts);
        analysis.html(renderAnalysis(functions, totalCounts));
        
        // shitcode
        $('thead>tr>th:first-child', analysis).click((event) => {
            let target = $(event.currentTarget);
            let tbody = target.closest('table').find('tbody');
            let sign = parseInt(target.data('order')) || 1;
            target.data('order', -sign);
            tbody[0].innerHTML = tbody
                .find('tr')
                .toArray()
                .sort((a, b) => {
                    a = $(a).find('td:first').text();
                    b = $(b).find('td:first').text();
                    return a == b ? 0 : sign > 0 ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
                })
                .reduce((html, tr) => html + tr.outerHTML, '');
        });
        $('thead>tr>th:last-child', analysis).click((event) => {
            let target = $(event.currentTarget);
            let tbody = target.closest('table').find('tbody');
            let sign = parseInt(target.data('order')) || 1;
            target.data('order', -sign);
            tbody[0].innerHTML = tbody
                .find('tr')
                .toArray()
                .sort((a, b) => sign * (parseInt($(a).find('td:last').text()) - parseInt($(b).find('td:last').text())))
                .reduce((html, tr) => html + tr.outerHTML, '');
        });
        $('thead>tr>th:last-child', analysis).click()
    }
    catch (e) {
        analysis.html('Invalid code');
        console.error(e);
    }
}
