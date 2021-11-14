import {Component} from "./framework";
import {enableGesture} from "./gesture";
import {Timeline, Animation} from "./animation";
import {ease} from "./ease";

export class Carousel extends Component {
    constructor() {
        super()
    }

    render() {
        this.root = document.createElement('div');
        console.log(this.attributes);
        this.root.classList.add('carousel');
        for (let src of this.attributes.src) {
            let child = document.createElement('div');
            child.style.backgroundImage = `url(${src})`;
            this.root.appendChild(child);
        }

        let position = 0;
        enableGesture(this.root);

        let timeline = new Timeline();
        timeline.start();

        let children = this.root.children;
        let handler = null;


        this.root.addEventListener('pan', event => {

        });

        this.root.addEventListener('end', event => {

        })

        let nextPicture = () => {

        };

        handler = setInterval(nextPicture, 3000);


        /*this.root.addEventListener('mousedown', event => {
            console.log('mousedown');
            let children = this.root.children;
            let startX = event.clientX


            let move = event => {
                console.log('mousemove');

                let deltaX = event.clientX - startX;


                let curr = position - Math.round((deltaX - deltaX % 400) / 400);

                console.log(deltaX, curr);
                for (let offset of [-2, -1, 0, 1, 2]) {
                    let pos = offset + curr;
                    pos = (pos + children.length) % children.length;
                    children[pos].style.transition = 'none';
                    children[pos].style.transform = `translateX(${-pos * 400 + offset * 400 + deltaX / 400}px)`;
                }
            }

            let up = event => {
                console.log('mouseup')
                let deltaX = event.clientX - startX;
                position = position - Math.round(deltaX / 400);
                for (let offset of [0, -Math.sign(Math.round(deltaX / 400) - deltaX + 200 * Math.sign(deltaX))]) {
                    let pos = offset + position;
                    pos = (pos + children.length) % children.length;
                    children[pos].style.transition = 'none';
                    children[pos].style.transform = `translateX(${-pos * 400 + offset * 400}px)`;
                }

                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up)
            }

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);

        })*/

        /*let currIndex = 0, nextIndex;
        setInterval(() => {
            let children = this.root.children;
            nextIndex = (currIndex + 1) % children.length;

            let curr = children[currIndex],
                next = children[nextIndex];

            next.style.transition = 'none';
            next.style.transform = `translateX(${100 - nextIndex * 100}%)`;
            setTimeout(() => {
                next.style.transition = '';
                curr.style.transform = `translateX(${-100 - currIndex * 100}%)`
                next.style.transform = `translateX(${-nextIndex * 100}%)`
                currIndex = nextIndex;
            }, 16)
        }, 3000)*/

        return this.root;
    }

    setAttribute(name, value) {
        this.attributes[name] = value;
    }

    mountTo(parent) {
        parent.appendChild(this.render());
    }
}
