import analyzeCode from './analyzer.js';

const inputCode = $('#code');
const inputMain = $('#main');
const buttonRun = $('#run');
const buttonAnalyze = $('#analyze');
const analysis = $('#analysis');

loadSampleCode();


buttonRun.click(() => runCode());
buttonAnalyze.click(() => renderAnalysis());
inputCode.on('keyup', () => renderAnalysis())

function loadSampleCode() {
    $.ajax('./sample.js', {
        dataType: 'text'
    }).done((data) => {
        inputCode.html(data);
        renderAnalysis();
    });
}

function runCode() {
    const funcText = `(function() { ${inputCode.html()}; ${inputMain.val()}})()`;
    try {
        eval(funcText);
    }
    catch(e) {
        console.error(e);
    }
}

function renderAnalysis() {
    analysis.html( analyzeCode( inputCode.val() ) )
}