export function createElement(type, attributes, ...children) {

    let element;
    console.log('type', type)
    if (typeof type === 'string') {
        element = new ElementWrapper(type)
    } else {
        element = new type();
    }

    for (let name in attributes) {
        element.setAttribute(name, attributes[name]);
    }

    for (let child of children) {
        console.log('child', child, element);
        if (typeof child === 'string') child = new TextWrapper(child);
        element.appendChild(child);
    }

    return element;
}


export class Component {
    constructor(type) {
        this.root = null;
    }

    setAttribute(name, value) {
        this.root.setAttribute(name, value);
    }

    appendChild(child) {
        console.log('-----', child);
        child.mountTo(this.root)
    }

    mountTo(parent) {
        parent.appendChild(this.root);
    }
}

class ElementWrapper extends Component {
    constructor(type) {
        super(type);
        this.root = document.createElement(type);
    }
}

class TextWrapper extends Component {
    constructor(type) {
        super(type);
        this.root = document.createTextNode(type);
    }
}




