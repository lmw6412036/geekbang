const element = document.documentElement;


export function dispatch(type, properties) {
    let event = new Event(type);
    for (let name in properties) {
        event[name] = properties[name];
    }
    element.dispatchEvent(event);
}

export class Listener {
    constructor(element, recognizer) {
        let contexts = new Map();
        let isListeningMouse = false;
        element.addEventListener('mousedown', event => {
            let context = Object.create(null);
            contexts.set('mouse' + (1 << event.button), context);
            recognizer.start(event, context)
            let mousemove = event => {
                let button = 1;
                while (button <= event.buttons) {
                    if (button && event.buttons) {
                        let key;
                        if (button === 4) key = 2;
                        else if (button === 2) key = 4;
                        else key = button
                        let context = contexts.get('mouse' + key);
                        recognizer.move(event, context);
                    }
                    button = button << 1;
                }

            }
            let mouseup = event => {
                let context = contexts.get('mouse' + (1 << event.button));
                recognizer.end(event, context);
                contexts.delete('mouse' + (1 << event.button));

                if (event.buttons === 0) {
                    document.removeEventListener('mousemove', mousemove)
                    document.removeEventListener('mouseup', mouseup);
                    isListeningMouse = false;
                }
            }
            if (!isListeningMouse) {
                document.addEventListener('mousemove', mousemove);
                document.addEventListener('mouseup', mouseup);
                isListeningMouse = true;
            }
        })

        element.addEventListener('touchstart', event => {
            for (const touch of event.changedTouches) {
                let context = Object.create(null);
                contexts.set(touch.identifier, context);
                recognizer.start(touch, context);
            }
        })

        element.addEventListener('touchmove', event => {
            for (const touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                recognizer.move(touch, context);
            }
        })

        element.addEventListener('touchend', event => {
            for (const touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                recognizer.end(touch, context);
                contexts.delete(touch.identifier);
            }
        })

        element.addEventListener('touchcancel', event => {
            for (const touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                recognizer.cancel(touch, context);
                contexts.delete(touch.identifier);
            }
        })
    }
}

export class Recognizer {
    constructor(dispatch) {
        this.dispatch = dispatch;
    }

    start(point, context) {

        context.points = [{
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        }]

        context.startX = point.clientX;
        context.startY = point.clientY;
        context.isPan = false;
        context.isTap = true;
        context.isPress = false;
        context.handler = setTimeout(() => {
            console.log('press')
            context.isPress = true;
            context.isPan = false;
            context.isTap = false;
            context.handler = null;
            this.dispatch('press', {});
        }, 500)
    }

    move(point, context) {
        let {startX, startY, isPan} = context;
        let dx = point.clientX - startX, dy = point.clientY - startY;
        if (!isPan && dx ** 2 + dy ** 2 > 100) {
            context.isPan = true;
            context.isPress = false;
            context.isTap = false;
            context.isVertical = Math.abs(dx) < Math.abs(dy)
            console.log('panstart');
            this.dispatch('panstart', {
                startX, startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical
            })
            clearTimeout(context.handler);
        }

        if (isPan) {
            console.log(dx, dy);
            console.log('pan');
            this.dispatch('pan', {
                startX, startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical
            })
        }

        context.points = [{
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        }]
    }

    end(point, context) {
        if (context.isTap) {
            console.log('tap');
            this.dispatch('tap', {})
            clearTimeout(context.handler);
        }

        if (context.isPress) {
            this.dispatch('pressend', {});
            console.log('pressend')
        }

        context.points = context.points.filter(point => Date.now() - point.t < 500);
        let v, d;
        if (!context.points.length) {
            v = 0;
        } else {
            d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2);
            v = d / (Date.now() - context.points[0].t);
        }
        if (v > 1.5) {
            context.isFlick = true;
        } else context.isFlick = false;


        if (context.isPan) {
            this.dispatch('panend', {
                startX: context.startX, startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick
            })
        }
    }

    cancel(point, context) {
        this.dispatch('cancel', {})
        clearTimeout(context.handler);
    }
}

export function enableGesture(element) {
    new Listener(element, new Recognizer(dispatch));
}
