const element = document.documentElement;
let contexts = new Map();
let isListeningMouse = false;
element.addEventListener('mousedown', event => {
    let context = Object.create(null);
    contexts.set('mouse' + (1 << event.button), context);

    start(event, context)
    let mousemove = event => {
        let button = 1;
        while (button <= event.buttons) {
            if (button && event.buttons) {
                let key;
                if (button === 4) key = 2;
                else if (button === 2) key = 4;
                else key = button
                let context = contexts.get('mouse' + key);
                move(event, context);
            }
            button = button << 1;
        }

    }
    let mouseup = event => {
        let context = contexts.get('mouse' + (1 << event.button));
        end(event, context);
        contexts.delete('mouse' + (1 << event.button));

        if (event.buttons === 0) {
            element.removeEventListener('mousemove', mousemove)
            element.removeEventListener('mouseup', mouseup);
            isListeningMouse = false;
        }
    }
    if (!isListeningMouse) {
        element.addEventListener('mousemove', mousemove);
        element.addEventListener('mouseup', mouseup);
        isListeningMouse = true;
    }
})


element.addEventListener('touchstart', event => {
    for (const touch of event.changedTouches) {
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        start(touch, context);
    }
})

element.addEventListener('touchmove', event => {
    for (const touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        move(touch, context);
    }
})

element.addEventListener('touchend', event => {
    for (const touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        end(touch, context);
        contexts.delete(touch.identifier);
    }
})

element.addEventListener('touchcancel', event => {
    for (const touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        cancel(touch, context);
        contexts.delete(touch.identifier);
    }
})

let handler;
let startX, startY;
let isPan = false, isTap = true, isPress = false;

let start = (point, context) => {
    context.startX = point.clientX;
    context.startY = point.clientY;
    context.isPan = false;
    context.isTap = true;
    context.isPress = false;
    context.handler = setTimeout(() => {
        console.log('pressstart')
        context.isPress = true;
        context.isPan = false;
        context.isTap = false;
        context.handler = null;
    }, 500)
}

let move = (point, context) => {
    let {startX, startY, isPan} = context;
    let dx = point.clientX - startX, dy = point.clientY - startY;
    if (!isPan && dx ** 2 + dy ** 2 > 100) {
        context.isPan = true;
        context.isPress = false;
        context.isTap = false;
        console.log('panstart');
        clearTimeout(context.handler);
    }

    if (isPan) {
        console.log(dx, dy);
        console.log('pan');
    }
}

let end = (point, context) => {
    if (context.isTap) {
        console.log('tap');
        clearTimeout(context.handler);
    }

    if (context.isPan) {
        console.log('panedn')
    }

    if (context.isPress) {
        console.log('pressend')
    }
}

let cancel = (point, context) => {
    clearTimeout(context.handler);
}
