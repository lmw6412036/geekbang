const EOF = Symbol('EOF');

function data(c) {
    console.log('char', c);

    return data;
}

exports.parseHTML = function (html) {

    let state = data;
    for (const htmlElement of html) {
        state = state(htmlElement);
    }
    state = state(EOF);
}
