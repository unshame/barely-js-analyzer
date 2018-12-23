function getC(x, y, z) {
    return ( Math.pow(Math.tan(x), 2) + Math.cos(y) ) / Math.sqrt(8 * z * z * z);
}

function printC(x, y, z) {
    const C = getC(x, y, z);
    console.log('C(%d, %d, %d) = %d', x, y, z, C);
}

function printRandomC() {
    printC(
        getRandomInt(-10, 10),
        getRandomInt(0, 5),
        getRandomInt(3, 13)
    );
}

function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
