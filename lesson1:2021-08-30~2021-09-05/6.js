function search(str) {
    let state = start;
    for (let char of str) {
        state = state(char);
    }
    return state === end;
}

function start(c) {
    if (c === 'a') {
        return findB;
    }
    return start;
}

function findB(c) {
    if (c === 'b') return findC;
    return start(c);
}

function findC(c) {
    if (c === 'c') return findD;
    return start(c);
}

function findD(c) {
    if (c === 'd') return findE;
    return start(c);
}

function findE(c) {
    if (c === 'e') return findF;
    return start(c);
}

function findF(c) {
    if (c === 'f') return end;
    return start(c);
}

function end(c) {
    return end;
}

function findB(c) {
    if(c==='b') return findC;
    return start(c);
}
console.log(search('abcdef'));
