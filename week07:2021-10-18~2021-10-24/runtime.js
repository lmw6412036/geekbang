export class Realm {
    constructor() {
        this.thisValue = new Map();
        this.variables = new Map();
        this.outer = null;
    }
}

export class ExecutionContent {
    constructor(realm, lexicalEnvironment, variableEnvironment) {
        variableEnvironment = variableEnvironment || lexicalEnvironment
        this.lexicalEnvironment = lexicalEnvironment;
        this.variableEnvironment = variableEnvironment;
        this.realm = {}
    }
}

export class Reference {
    constructor(object, property) {
        this.object = object;
        this.property = property;
    }

    get() {
        return this.object[this.property]
    }

    set(value) {
        this.object[this.property] = value;
    }

}

// number string boolean object null undefined symbol

export class JSValue {
    get type() {
        if (this.constructor === JSNumber) return 'number'
        if (this.constructor === JSBoolean) return 'boolean'
        if (this.constructor === JSString) return 'string'
        if (this.constructor === JSObject) return 'object'
        if (this.constructor === JSNull) return 'null'
        if (this.constructor === JSUndefined) return 'undefined'
        if (this.constructor === JSSymbol) return 'symbol'
        return 'undefined'
    }
}

export class JSNumber extends JSValue {
    constructor(value) {
        super()
        this.memory = new ArrayBuffer(8);
        if (arguments.length)
            new Float64Array(this.memory)[0] = value;
        else
            new Float64Array(this.memory)[0] = 0;
    }

    get value() {
        return new Float64Array(this.memory)[0]
    }

    toString() {

    }

    toNumber() {
        return this;
    }

    toBoolean() {
        if (new Float64Array(this.memory)[0] === 0)
            return new JSBoolean(false)
        return new JSBoolean(true);
    }
}

export class JSString extends JSValue {
    constructor(characters) {
        super()
        this.charactters = characters;
        // this.memory = new ArrayBuffer(characters.length);
    }

    toString() {
        return this;
    }
}

export class JSBoolean extends JSValue {
    constructor(value) {
        super();
        this.value = value || false;
    }

    toNumber() {
        if (this.value) return new JSNumber(1)
        return new JSNumber(0);
    }

    toString() {
        if (this.value)
            return new JSString(['t', 'r', 'u', 'e'])
        return new JSString(['f', 'a', 'l', 's', 'e'])
    }

    toBoolean() {
        return this;
    }

}

export class JSObject extends JSValue {
    constructor() {
        super();
        this.properties = new Map();
        this.prototype = null
    }

    setProperty(name, attributes) {
        this.properties.set(name, attributes);
    }

    setPrototype(proto) {
        this.prototype = proto;
    }

    getPrototype() {
        return this.prototype;
    }
}

export class JSNull extends JSValue {
    toNumber() {
        return new JSNumber(0);
    }

    toString() {
        return new JSString(['n', 'u', 'l', 'l'])
    }

    toBoolean() {
        return new JSBoolean(false);
    }
}

export class JSUndefined extends JSValue {
    toNumber() {
        return new JSNumber(0);
    }

    toString() {
        return new JSString(['u', 'n', 'd', 'e', 'f', 'i', 'n', 'e', 'd']);
    }

    toBoolean() {
        return new JSBoolean(false);
    }
}

export class JSSymbol extends JSValue {
    constructor(name) {
        super();
        this.name = name;
    }
}

export class EnvironmentRecord {
    constructor(outer) {
        this.variables = new Map();
        this.outer = outer;
    }

    add(name) {
        this.variables.set(name, new JSUndefined())
    }

    get(name) {
        if (this.variables.has(name))
            return this.variables.get(name);
        else if (this.outer) {
            return this.outer.get(name);
        }
        return new JSUndefined()
    }

    set(name, value = new JSUndefined()) {
        if (this.variables.has(name)) {
            this.variables.set(name, value)
        } else if (this.outer.has(name)) {
            this.outer.set(name, value)
        } else
            this.variables.set(name, value)
    }
}

export class ObjectEnvironmentRecord {
    constructor(object, outer) {
        this.outer = outer;
        this.object = object;
    }

    add(name) {
        this.object.set(name, new JSUndefined())
    }

    set(name, value = new JSUndefined()) {
        this.object.set(name, value);
    }

    get(name) {
        return this.object.get(name);
    }
}

export class CompletionRecord {
    constructor(type, value, target) {
        this.type = type || 'normal';
        this.value = value || new JSUndefined();
        this.target = target || null
    }
}
