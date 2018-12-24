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
    }
    catch (e) {
        analysis.html('Invalid code');
        console.error(e);
    }
}