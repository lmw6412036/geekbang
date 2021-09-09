const EOF = Symbol('EOF');
const isAlphabet = c => /^[a-zA-Z]$/.test(c);
const isBlank = c => /^[\f\t\n ]$/.test(c);
let currentToken = null

function emit(token) {
    console.log(token);
}

function data(c) {
    console.log('char', c);
    if (c === '<') return tagOpen;
    else if (c === EOF) {
        emit({
            type: 'EOF'
        });
        return;
    } else {
        emit({
            type: 'text',
            content: c
        });
        return data;
    }
}

function tagOpen(c) {
    if (c === '/') return endTagOpen;
    else if (isAlphabet(c)) {
        currentToken = {
            type: "startTag",
            tagName: ''
        }
        return tagName(c);
    } else return data;
}

function endTagOpen(c) {
    if (isAlphabet(c)) {
        currentToken = {
            type: "endTag",
            tagName: ''
        }
        return tagName(c);
    } else if (c === '>') {

    } else if (c === EOF) {

    } else {

    }
}

function tagName(c) {
    if (isBlank(c)) {
        return beforeAttributeName;
    } else if (c === '/') return selfClosingStartTag;
    else if (isAlphabet(c)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === '>') {
        emit(currentToken);
        return data
    }
    return tagName;
}

function beforeAttributeName(c) {
    if (isBlank(c)) return beforeAttributeName;
    else if (c === '>') return data;
    else if (c === '=') return beforeAttributeName;
    return beforeAttributeName;
}

function selfClosingStartTag(c) {
    if (c === '>') {
        currentToken.isSelfClosing = true;
        return data;
    } else if (c === EOF) {

    } else {

    }
}

exports.parseHTML = function (html) {

    let state = data;
    for (const htmlElement of html) {
        state = state(htmlElement);
    }
    state = state(EOF);
}
