const TICK = Symbol('tick');
const TICK_HANDLER = Symbol('tick-handler');
const ANIMATIONS = Symbol('animations');
const START_TIME = Symbol('start-time')
const PAUSE_TIME = Symbol('pause-time');
const PAUSE_START = Symbol('pause-start');


export class Timeline {
    constructor() {
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
        this.state = 'inited';
    }

    start() {
        if (this.state !== 'inited') return;
        this.state = 'started';
        let startTime = Date.now();
        this[PAUSE_TIME] = 0;
        this[TICK] = () => {
            let now = Date.now()
            for (let animation of this[ANIMATIONS]) {
                let t;
                if (this[START_TIME].get(animation) < startTime) {
                    t = now - startTime - this[PAUSE_TIME] - animation.delay;
                } else
                    t = now - this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay;
                if (animation.duration < t) {
                    this[ANIMATIONS].delete(animation);
                    t = animation.duration;
                }
                animation.receiveTime(t);
            }
            this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
        }
        this[TICK]();
    }

    pause() {
        if (this.state !== 'started') return;
        this.state = 'paused';
        this[PAUSE_START] = Date.now();
        cancelAnimationFrame(this[TICK_HANDLER])
    }

    resume() {
        this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
        this[TICK]();
    }

    reset() {
        this.pause();
        this.state = 'inited';
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
        this[PAUSE_TIME] = 0;
        this[PAUSE_START] = 0;
        this[TICK_HANDLER] = null;
    }

    add(animation, startTime) {
        if (arguments.length < 2) {
            startTime = Date.now();
        }
        this[START_TIME].set(animation, startTime);
        this[ANIMATIONS].add(animation)
    }
}

export class Animation {
    constructor(object, property, startValue, endValue, duration, delay, timingFunction, template) {
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.delay = delay;
        this.template = template || (v => v);
        this.timingFunction = timingFunction || (v => v);
    }

    receiveTime(time) {
        let range = this.endValue - this.startValue;
        let progress = time / this.duration
        this.object[this.property] = this.template(this.startValue + range * this.timingFunction(progress));
    }
}
