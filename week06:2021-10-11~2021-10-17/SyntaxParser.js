import {scan} from "./lexParser.js";

const EOF = 'EOF'

const syntax = {
    Program: [['StatementList', EOF]],
    StatementList: [
        ['Statement'],
        ['StatementList', 'Statement']
    ],
    Statement: [
        ['ExpressionStatement'],
        ['IfStatement'],
        ['VariableDeclaration'],
        ['FunctionDeclaration']
    ],
    IfStatement: [
        ['if', '(', 'Expression', ')', 'Statement']
    ],
    VariableDeclaration: [
        ['var', 'Identifier', ';'],
        ['let', 'Identifier', ';']
    ],
    FunctionDeclaration: [
        ['function', 'Identifier', '(', ')', '{', 'StatementList', '}']
    ],
    ExpressionStatement: [
        ['Expression', ';']
    ],
    Expression: [
        ['AdditiveExpression']
    ],
    AdditiveExpression: [
        ['MultiplicativeExpression'],
        ['AdditiveExpression', '+', 'MultiplicativeExpression'],
        ['AdditiveExpression', '-', 'MultiplicativeExpression']
    ],
    MultiplicativeExpression: [
        ['PrimaryExpression'],
        ['MultiplicativeExpression', '*', 'PrimaryExpression'],
        ['MultiplicativeExpression', '/', 'PrimaryExpression'],
    ],
    PrimaryExpression: [
        ['(', 'Expression', ')'],
        ['Literal'],
        ['Identifier']
    ],
    Literal: [
        ['NumericLiteral'],
        ['BooleanLiteral'],
        ['StringLiteral'],
        ['NullLiteral'],
        ['RegularExpressionLiteral'],
        ['ObjectLiteral'],
        ['ArrayLiteral']
    ]
}

let hash = {};

function closure(state) {
    let key = JSON.stringify(state);
    hash[key] = state;
    let queue = [];
    for (let symbol in state) {
        if (symbol.match(/^\$/)) {
            return;
        }
        queue.push(symbol);
    }
    while (queue.length) {
        let symbol = queue.shift();
        // console.log('symbol', symbol);
        if (syntax[symbol]) {
            for (let rule of syntax[symbol]) {
                if (!state[rule[0]]) {
                    queue.push(rule[0])
                }
                let current = state;
                for (let part of rule) {
                    if (!current[part]) {
                        current[part] = {}
                    }
                    current = current[part];
                }
                current.$reduceType = symbol;
                current.$reduceLength = rule.length;
            }
        }
    }

    for (let symbol in state) {
        if (symbol.match(/^\$/)) {
            return;
        }
        let key = JSON.stringify(state[symbol]);
        if (hash[key]) {
            state[symbol] = hash[key];
        } else
            closure(state[symbol]);
    }
}

const end = {
    $isEnd: true
}

let start = {
    Program: end
}

closure(start);

console.log(start);

function parse(source) {
    let stack = [start];
    let symbolStack = [];

    function reduce() {
        let state = stack[stack.length - 1];
        if (state.$reduceType) {
            let children = [];
            for (let i = 0; i < state.$reduceLength; i++) {
                stack.pop();
                children.push(symbolStack.pop());
            }

            return {
                type: state.$reduceType,
                children: children.reverse()
            }
        } else {
            console.error(state);
            throw new Error('unexpected token');
        }
    }

    function shift(symbol) {
        let state = stack[stack.length - 1];
        if (symbol.type in state) {
            stack.push(state[symbol.type]);
            symbolStack.push(symbol);
        } else {
            shift(reduce());
            shift(symbol);
        }
    }

    for (let symbol of scan(source)) {
        shift(symbol);
    }

    return reduce();
}

let evaluator = {
    Program(node) {
        return evaluate(node.children[0]);
    },
    StatementList(node) {
        if (node.children.length === 1)
            return evaluate(node.children[0]);
        else {
            evaluate(node.children[0]);
            return evaluate(node.children[1]);
        }
    },
    Statement(node) {
        return evaluate(node.children[0]);
    },
    VariableDeclaration(node) {
        console.log('VariableDeclaration', node, node.children[1].name);
    },
    ExpressionStatement(node) {
        return evaluate(node.children[0])
    },
    Expression(node) {
        return evaluate(node.children[0]);
    },
    AdditiveExpression(node) {
        if (node.children.length === 1)
            return evaluate(node.children[0]);
    },
    MultiplicativeExpression(node) {
        if (node.children.length === 1)
            return evaluate(node.children[0]);
    },
    PrimaryExpression(node) {
        if (node.children.length === 1)
            return evaluate(node.children[0]);
    },
    Literal(node) {
        return evaluate(node.children[0]);
    },
    NumericLiteral(node) {
        let str = node.value;
        let l = str.length;
        let value = 0;
        let n = 10;

        if (str.match(/^0b/)) {
            n = 2;
            l -= 2;
        } else if (str.match(/^0o/)) {
            n = 8;
            l -= 2;
        } else if (str.match(/^0x/)) {
            n = 16;
            l -= 2;
        }

        while (l--) {
            let c = str.charCodeAt(str.length - l - 1);
            if (c >= 'a'.charCodeAt(0)) {
                c = c - 'a'.charCodeAt(0) + 10;
            } else if (c >= 'A'.charCodeAt(0)) {
                c = c - 'A'.charCodeAt(0) + 10;
            } else if (c >= '0'.charCodeAt(0)) {
                c = c - '0'.charCodeAt(0);
            }

            value = value * n + c;
        }
        console.log(value);
        return Number(node.value);
    },
    StringLiteral(node) {
        let i = 1;
        let ans = [];
        for (let j = 1; j < node.value.length - 1; j++) {
            if (node.value[j] === '\\') {
                j++;
                let c = node.value[j];
                let map = {
                    "\"": "\"",
                    "\'": "\'",
                    "\\": "\\",
                    "0": String.fromCharCode(0x0000),
                    "b": String.fromCharCode(0x0008),
                    "f": String.fromCharCode(0x000C),
                    "n": String.fromCharCode(0x000A),
                    "r": String.fromCharCode(0x000D),
                    "t": String.fromCharCode(0x0009),
                    "v": String.fromCharCode(0x000B),
                }
                if (c in map) {
                    ans.push(map[c]);
                } else ans.push(c);
            } else
                ans.push(node.value[j])
        }
        return ans.join('');
    },
    EOF() {
        return null;
    }

};

function evaluate(node) {
    if (evaluator[node.type])
        return evaluator[node.type](node);
}


// let source = `"abs";`;


/*let tree = parse(source);

evaluate(tree);*/


document.getElementById('runBtn').addEventListener('click', function () {
    let source = document.getElementById('source').value;
    let tree = parse(source);
    evaluate(tree);
})

