import {
    ExecutionContent,
    JSBoolean,
    JSNull,
    JSNumber,
    JSObject,
    JSString,
    JSUndefined,
    Realm,
    Reference
} from "./runtime.js";

export class Evaluator {
    constructor() {
        this.realm = new Realm();
        this.globalObject = {};
        this.ecs = [new ExecutionContent(
            this.realm,
        )];
    }

    evaluate(node) {
        if (this[node.type])
            return this[node.type](node);
    }

    Program(node) {
        return this.evaluate(node.children[0]);
    }

    IfStatement(node) {
        console.log(node);
        let condition = this.evaluate(node.children[2]);
        if (condition instanceof Reference) {
            condition = condition.get();
        }
        if (condition.toBoolean().value) {
            //debugger;
            return this.evaluate(node.children[4]);
        }
    }

    WhileStatement(node) {
        while (true) {
            let condition = this.evaluate(node.children[2]);
            if (condition instanceof Reference) {
                condition = condition.get();
            }
            if (condition.toBoolean().value) {
                //debugger;
                return this.evaluate(node.children[4]);
            } else
                break;
        }
    }

    StatementList(node) {
        if (node.children.length === 1)
            return this.evaluate(node.children[0]);
        else {
            this.evaluate(node.children[0]);
            return this.evaluate(node.children[1]);
        }
    }

    Statement(node) {
        return this.evaluate(node.children[0]);
    }

    VariableDeclaration(node) {
        console.log('VariableDeclaration', node, node.children[1].name);
        let runningEC = ecs[ecs.length - 1];
        runningEC.lexicalEnvironment[node.children[1].name] = new JSUndefined();
    }

    ExpressionStatement(node) {
        return this.evaluate(node.children[0])
    }

    Expression(node) {
        return this.evaluate(node.children[0]);
    }

    AdditiveExpression(node) {
        if (node.children.length === 1)
            return this.evaluate(node.children[0]);
        else {
            let left = this.evaluate(node.children[0]);
            let right = this.evaluate(node.children[2]);
            if (left instanceof Reference) left = left.get();
            if (right instanceof Reference) right = right.get();

            if (node.children[1].type === '+') {
                return new JSNumber(left.value + right.value)
            }
            if (node.children[1].type === '-') {
                return new JSNumber(left.value - right.value)
            }
            if (node.children[1].type === '*') {
                return new JSNumber(left.value * right.value)
            }
            if (node.children[1].type === '/') {
                return new JSNumber(left.value / right.value)
            }
        }
    }

    MultiplicativeExpression(node) {
        if (node.children.length === 1)
            return this.evaluate(node.children[0]);
    }

    PrimaryExpression(node) {
        if (node.children.length === 1)
            return this.evaluate(node.children[0]);
    }

    Literal(node) {
        return this.evaluate(node.children[0]);
    }

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
        return new JSNumber(value);
    }

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
        return new JSString(ans);
    }

    ObjectLiteral(node) {
        //{"a":1}
        if (node.children.length === 2) return {}
        if (node.children.length === 3) {
            let object = new JSObject();
            this.PropertyList(node.children[1], object);
            console.log(object);
            return object;
        }
    }

    PropertyList(node, object) {
        if (node.children.length === 1) {
            this.Property(node.children[0], object);
        } else {
            this.PropertyList(node.children[0], object);
            this.Property(node.children[2], object);
        }
    }

    Property(node, object) {
        console.log(node);
        let name;
        if (node.children[0].type === 'Identifier') {
            name = node.children[0].name;
        } else if (node.children[0].type === 'StringLiteral') {
            name = this.evaluate(node.children[0]);
        }
        object.set(name, {
            value: this.evaluate(node.children[2]),
            writable: true,
            enumerable: true,
            configurable: true
        });
    }

    BooleanLiteral(node) {
        if (node.value === 'false')
            return new JSBoolean(false)
        return new JSBoolean(true)
    }

    NullLiteral() {
        return new JSNull()
    }

    AssignmentExpression(node) {
        console.log(node);
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        }
        let left = this.evaluate(node.children[0]);
        let right = this.evaluate(node.children[2]);
        left.set(right);
        return left;
    }

    LogicalORExpression(node) {
        if (node.children.length === 1)
            return this.evaluate(node.children[0])

        let ans = this.evaluate(node.children[0]);
        if (ans) return ans;
        return this.evaluate(node.children[2]);
    }

    LogicalORExpression(node) {
        if (node.children.length === 1)
            return this.evaluate(node.children[0])

        let ans = this.evaluate(node.children[0]);
        if (!ans) return ans;
        return this.evaluate(node.children[2]);
    }

    LeftHandSideExpression(node) {
        return this.evaluate(node.children[0]);
    }

    NewExpression(node) {
        if (node.children.length === 1)
            return this.evaluate(node.children[0]);
        if (node.children.length === 2) {
            let cls = this.evaluate(node.children[1])
            return cls.construct();
            /*let object = this.realm.Object.construct();
            let cls = this.evaluate(node.children[1])
            let ans = cls.call(object);
            if (typeof ans === 'object')
                return ans;
            else
                return object;*/
        }
    }

    CallExpression(node) {
        if (node.children.length === 1)
            return this.evaluate(node.children[0]);
        if (node.children.length === 2) {
            let func = this.evaluate(node.children[0]);
            let args = this.evaluate(node.children[1]);
            return func.call(args);
        }
    }

    MemberExpression(node) {
        if (node.children.length === 1)
            return this.evaluate(node.children[0]);
        if (node.children.length === 3) {
            let obj = this.evaluate(node.children[0]).get();
            let prop = obj.get(node.children[2].name);
            if ('value' in prop) {
                return prop.value
            }
            if ('get' in prop)
                return prop.get.call(obj);
        }
    }

    Identifier(node) {
        console.log(node);
        let ecs = this.ecs;
        let runningECS = ecs[ecs.length - 1];
        return new Reference(runningECS.lexicalEnvironment, node.name);
    }

    Block(node) {
        if (node.children.length === 2) {
            return ''
        }
    }

    EOF() {
        return null;
    }

}
