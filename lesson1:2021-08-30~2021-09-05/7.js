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
    if (c === 'c') return findA2;
    return start(c);
}

function findA2(c) {
    if (c === 'a') return findB2;
    return start(c);
}

function findB2(c) {
    if (c === 'b') return findX;
    return start(c);
}

function findX(c) {
    if (c === 'x') return end;
    return findC(c);
}

function end(c) {
    return end;
}

function findB(c) {
    if (c === 'b') return findC;
    return start(c);
}

console.log(search('abcabyab'));
