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
