const css = require('css');
const EOF = Symbol('EOF');
const isAlphabet = c => /^[a-zA-Z]$/.test(c);
const isBlank = c => /^[\f\t\n ]$/.test(c);
let currentToken = null
let currentAttribute = null
let currentTextNode;

let stack = [{type: "document", children: []}];
let rules = [];

function addCSSRules(text) {
    const ast = css.parse(text);
    rules.push(...ast.stylesheet.rules);
}

function computeCSS(element) {
    const elements = stack.slice().reverse();
    if (!element.computedStyle) {
        element.computedStyle = {}
    }

    for (let rule of rules) {
        let selectorParts = rule.selectors[0].split(' ').reverse();
        if (!match(element, selectorParts[0])) {
            continue;
        }

        let matched = false;

        let j = 1;
        for (let i = 0; i < elements.length; i++) {
            if (match(elements[i], selectorParts[j])) {
                j++;
            }
        }

        if (j >= selectorParts.length) {
            matched = true;
        }

        if (matched) {
            let sp = specificity(rule.selectors[0]);
            let computedStyle = element.computedStyle;
            for (let declaration of rule.declarations) {
                const property = declaration.property;
                if (!computedStyle[property]) {
                    computedStyle[property] = {}
                }
                if (!computedStyle[property].specificity) {
                    computedStyle[property].value = declaration.value;
                    computedStyle[property].specificity = sp;
                } else if (compare(computedStyle[property].specificity, sp)) {
                    computedStyle[property].value = declaration.value;
                    computedStyle[property].specificity = sp;
                }
            }
        }
    }

}

function match(element, selector) {
    if (!selector || !element.attributes) return false;
    let firstChar = selector.charAt(0);
    let attr
    if (firstChar === '#') {
        attr = element.attributes.find(r => r.name === 'id');
        if (attr && attr.value === selector.replace('#', '')) {
            return true;
        }
    } else if (firstChar === '.') {
        attr = element.attributes.find(r => r.name === 'class');
        if (attr && attr.value === selector.replace('.', '')) {
            return true;
        }
    } else {
        if (element.tagName === selector) {
            return true;
        }
    }
    return false;
}

function specificity(selector) {
    let p = [0, 0, 0, 0];
    let selectorParts = selector.split(' ');
    for (let part of selectorParts) {
        if (part[0] === '#') p[1]++;
        else if (part[0] === '.') p[2]++;
        else p[3]++;
    }
    return p;
}

function compare(sp1, sp2) {
    if (sp1[0] - sp2[0]) return sp1[0] - sp2[0];
    if (sp1[1] - sp1[1]) return sp1[1] - sp2[1];
    if (sp1[2] - sp1[2]) return sp1[2] - sp2[2];
    return sp1[3] - sp2[3];
}

function emit(token) {
    let top = stack[stack.length - 1];
    if (token.type === 'startTag') {
        let element = {
            type: 'element',
            children: [],
            attributes: []
        }

        element.tagName = token.tagName;

        for (let key in token) {
            if (key !== 'type' && key !== 'tagName') {
                element.attributes.push({
                    name: key,
                    value: token[key]
                })
            }
        }

        computeCSS(element);

        top.children.push(element);
        element.parent = top;

        if (!token.isSelfClosing) {
            stack.push(element)
        }

        currentTextNode = null;
    } else if (token.type === 'endTag') {
        if (top.tagName !== token.tagName)
            throw new Error('标签不匹配');
        else {
            if (top.tagName === 'style') {
                addCSSRules(top.children[0].content);
            }
            stack.pop();
        }
        currentTextNode = null;
    } else if (token.type === 'text') {
        if (currentTextNode === null) {
            currentTextNode = {
                type: 'text',
                content: ''
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

function data(c) {
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
    } else {
        emit({
            type: 'text',
            content: c
        });
        return
    }
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
    } else {
        currentToken.tagName += c;
        return tagName;
    }

}

function beforeAttributeName(c) {
    if (isBlank(c)) return beforeAttributeName;
    else if (c === '>' || c === '/' || c === EOF) return afterAttributeName(c);
    else if (c === '=') {

    } else {
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c);
    }
}

function afterAttributeName(c) {
    if (isBlank(c)) {
        return afterAttributeName;
    } else if (c === '/') return selfClosingStartTag;
    else if (c === '=') return beforeAttributeValue;
    else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c);
    }
}

function attributeName(c) {
    if (isBlank(c) || c === '/' || c === '>' || c === EOF) {
        return afterAttributeName(c);
    } else if (c === '=') {
        return beforeAttributeValue;
    } else if (c === '\u0000') {

    } else if (c === '"' || c === "'" || c === '<') {

    } else {
        currentAttribute.name += c;
        return attributeName
    }
}

function beforeAttributeValue(c) {
    if (isBlank(c) || c === '/' || c === '>' || c === EOF) {
        return beforeAttributeValue;
    } else if (c === '"') return doubleQouteAttributeValue;
    else if (c === "'") return singleQouteAttributeValue;
    else if (c === '>') {

    } else return unQouteAttributeValue(c);
}

function doubleQouteAttributeValue(c) {
    if (c === '"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterDoubleQouteAttributeValue
    } else if (c === '\u0000') {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQouteAttributeValue;
    }
}

function singleQouteAttributeValue(c) {
    if (c === '"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterDoubleQouteAttributeValue
    } else if (c === '\u0000') {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return singleQouteAttributeValue;
    }
}

function unQouteAttributeValue(c) {
    if (isBlank(c)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (c === '/') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data
    } else if (c === '\u0000') {

    } else if (c === '"' || c === "'" || c === '<' || c === '=' || c === '`') {

    } else if (c === EOF) {

    } else {
        currentAttribute += c;
        return unQouteAttributeValue;
    }
}

function afterDoubleQouteAttributeValue(c) {
    if (isBlank(c)) return beforeAttributeName;
    else if (c === '/') return selfClosingStartTag;
    else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data
    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQouteAttributeValue
    }
}


function selfClosingStartTag(c) {
    if (c === '>') {
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    } else if (c === EOF) {

    } else {

    }
}

exports.parseHTML = function (html) {
    let state = data;
    for (let i = 0; i < html.length; i++) {
        let char = html.charAt(i);
        state = state(char);
    }
    state = state(EOF);
}
