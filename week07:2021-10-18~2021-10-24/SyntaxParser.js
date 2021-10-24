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
        ['WhileStatement'],
        ['VariableDeclaration'],
        ['FunctionDeclaration'],
        ['Block']
    ],
    WhileStatement: [
        ['while', '(', 'Expression', ')', 'Statement']
    ],
    Block: [
        ['{', 'StatementList', '}']
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
        ['AssignmentExpression']
    ],
    AssignmentExpression: [
        ['LeftHandSideExpression', '=', 'LogicalORExpression'],
        ['LogicalORExpression']
    ],
    LogicalORExpression: [
        ['LogicalANDExpression'],
        ['LogicalORExpression', '||', 'LogicalANDExpression']
    ],
    LogicalANDExpression: [
        ['AdditiveExpression'],
        ['LogicalANDExpression', '&&', 'AdditiveExpression']
    ],
    AdditiveExpression: [
        ['MultiplicativeExpression'],
        ['AdditiveExpression', '+', 'MultiplicativeExpression'],
        ['AdditiveExpression', '-', 'MultiplicativeExpression']
    ],
    MultiplicativeExpression: [
        ['LeftHandSideExpression'],
        ['MultiplicativeExpression', '*', 'LeftHandSideExpression'],
        ['MultiplicativeExpression', '/', 'LeftHandSideExpression'],
    ],
    LeftHandSideExpression: [
        ['CallExpression'],
        ['NewExpression']
    ],
    CallExpression: [
        ['MemberExpression', 'Arguments'],
        ['CallExpression', 'Arguments']
    ],
    NewExpression: [
        ['MemberExpression'],
        ['new', 'NewExpression']
    ],
    MemberExpression: [
        ['PrimaryExpression'],
        ['PrimaryExpression', '.', 'Identifier'],
        ['PrimaryExpression', '[', 'Expression', ']']
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
    ],
    ObjectLiteral: [
        ['{', '}'],
        ['{', 'PropertyList', '}']
    ],
    PropertyList: [
        ['Property'],
        ['PropertyList', ',', 'Property']
    ],
    Property: [
        ['StringLiteral', ':', 'AdditiveExpression'],
        ['Identifier', ',', 'AdditiveExpression']
    ],

}

let hash = {};

function closure(state) {
    let key = JSON.stringify(state);
    hash[key] = state;
    let queue = [];
    for (let symbol in state) {
        if (symbol.match(/^\$/)) {
            continue;
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
            continue;
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

// console.log(start);

export function parse(source) {
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


// let source = `"abs";`;


/*let tree = parse(source);

evaluate(tree);*/




